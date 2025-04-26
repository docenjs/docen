import { strFromU8, unzip } from "fflate";
import type { Plugin } from "unified";
import type { Literal, Node, Parent } from "unist";
import type { VFile } from "vfile";
import { fromXml } from "xast-util-from-xml";
import { toString as xastToString } from "xast-util-to-string";
import type {
  OoxmlBlockContent,
  OoxmlBookmarkEnd,
  OoxmlBookmarkStart,
  OoxmlBreak,
  OoxmlComment,
  OoxmlCommentReference,
  OoxmlContent,
  OoxmlDrawing,
  OoxmlHyperlink,
  OoxmlImage,
  OoxmlInlineContent,
  OoxmlList,
  OoxmlListItem,
  OoxmlNode,
  OoxmlParagraph,
  OoxmlRoot,
  OoxmlTable,
  OoxmlTableCell,
  OoxmlTableRow,
  OoxmlTextRun,
  XastElement,
  XastNode,
  XastRoot,
  XastText,
} from "../ast";
import type {
  BorderProperties,
  BorderStyleProperties,
  FillProperties,
  FontProperties,
  IndentationProperties,
  ParagraphFormatting,
  PositionalProperties,
  SharedAbstractNumDefinition,
  SharedNumInstanceDefinition,
  SharedNumberingLevelDefinition,
  SharedResources,
  SharedStyleDefinition,
  SpacingProperties,
} from "../ast/common-types";

// Type for relationship mapping
type RelationshipMap = Record<
  string,
  { type: string; target: string; targetMode?: string }
>;

// --- Utility Functions ---

// Function to safely get Ooxml properties from data field
function getOoxmlDataProps<T extends XastNode | OoxmlNode>(
  node: T,
): Record<string, any> | undefined {
  // @ts-ignore
  return node?.data?.properties;
}

// Function to safely get specific Ooxml type from data field
function getOoxmlType<T extends XastNode | OoxmlNode>(
  node: T,
): string | undefined {
  // @ts-ignore
  return node?.data?.ooxmlType;
}

// Helper to merge properties (Restored and kept as is)
function mergeProps<T extends object>(...objects: (T | undefined | null)[]): T {
  const result: Partial<T> = {};
  for (const obj of objects) {
    if (obj) {
      for (const key of Object.keys(obj) as Array<keyof T>) {
        if (
          Object.prototype.hasOwnProperty.call(obj, key) &&
          obj[key] !== undefined
        ) {
          result[key] = obj[key];
        }
      }
    }
  }
  return result as T;
}

// Helper to recursively resolve style inheritance (Needs further adaptation)
function resolveStyleChain(
  styleId: string | undefined,
  styles: Record<string, SharedStyleDefinition> | undefined,
  type: "paragraph" | "character",
  depth = 0,
): any {
  console.warn(
    "resolveStyleChain needs adaptation for data properties and SharedStyleDefinition structure.",
  );
  if (!styleId || !styles?.[styleId] || depth > 10) {
    // Added check for styles object
    return {};
  }
  const style = styles[styleId];
  const baseStyleProps = resolveStyleChain(
    style.basedOn,
    styles,
    type,
    depth + 1,
  );

  let currentStyleProps = {};
  if (type === "paragraph" && style.paragraphProps) {
    currentStyleProps = style.paragraphProps;
  } else if (type === "character" && style.runProps) {
    currentStyleProps = style.runProps;
  } else if (
    type === "character" &&
    style.type === "paragraph" &&
    style.runProps
  ) {
    currentStyleProps = style.runProps;
  }

  return mergeProps(baseStyleProps, currentStyleProps);
}

// --- Style Parsing Logic ---

// Helper to parse <w:rPr> into FontProperties
function parseRPr(rPrElement: XastElement | undefined): FontProperties {
  if (
    !rPrElement ||
    rPrElement.type !== "element" ||
    rPrElement.name !== "w:rPr"
  )
    return {};
  const props: FontProperties = {};

  const rFonts = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:rFonts",
  ) as XastElement | undefined;
  if (rFonts?.attributes) {
    props.name = String(
      rFonts.attributes["w:ascii"] ||
        rFonts.attributes["w:hAnsi"] ||
        rFonts.attributes["w:eastAsia"] ||
        rFonts.attributes["w:cs"] ||
        "",
    );
  }
  const boldElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:b",
  ) as XastElement | undefined;
  if (
    boldElement &&
    boldElement.attributes?.["w:val"] !== "false" &&
    boldElement.attributes?.["w:val"] !== "0"
  ) {
    props.bold = true;
  }
  const italicElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:i",
  ) as XastElement | undefined;
  if (
    italicElement &&
    italicElement.attributes?.["w:val"] !== "false" &&
    italicElement.attributes?.["w:val"] !== "0"
  ) {
    props.italic = true;
  }
  const underlineElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:u",
  ) as XastElement | undefined;
  if (underlineElement?.attributes?.["w:val"]) {
    props.underline = String(
      underlineElement.attributes["w:val"],
    ) as FontProperties["underline"];
  }

  console.warn("parseRPr needs implementation for size, color, etc.");
  return props;
}

// Helper to parse <w:pPr> into ParagraphFormatting
function parsePPr(pPrElement: XastElement | undefined): ParagraphFormatting {
  if (
    !pPrElement ||
    pPrElement.type !== "element" ||
    pPrElement.name !== "w:pPr"
  )
    return {};
  const props: ParagraphFormatting = {};

  const pStyleElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:pStyle",
  ) as XastElement | undefined;
  if (pStyleElement?.attributes?.["w:val"]) {
    props.styleId = String(pStyleElement.attributes["w:val"]);
  }

  const jcElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:jc",
  ) as XastElement | undefined;
  if (jcElement?.attributes?.["w:val"]) {
    props.alignment = String(
      jcElement.attributes["w:val"],
    ) as ParagraphFormatting["alignment"];
  }

  const numPrElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:numPr",
  ) as XastElement | undefined;
  if (numPrElement) {
    const ilvlElement = numPrElement.children?.find(
      (child) => child.type === "element" && child.name === "w:ilvl",
    ) as XastElement | undefined;
    const numIdElement = numPrElement.children?.find(
      (child) => child.type === "element" && child.name === "w:numId",
    ) as XastElement | undefined;
    const ilvlVal = ilvlElement?.attributes?.["w:val"];
    const numIdVal = numIdElement?.attributes?.["w:val"];
    if (ilvlVal !== undefined && numIdVal !== undefined) {
      const level = Number(ilvlVal);
      if (!Number.isNaN(level)) {
        props.numbering = {
          level: level,
          id: String(numIdVal),
        };
      }
    }
  }

  console.warn("parsePPr needs implementation for spacing, indent, etc.");
  return props;
}

// Generic property parser
function parseProperties(
  propElement: XastElement | undefined,
): Record<string, any> {
  if (!propElement || propElement.type !== "element") return {};

  if (propElement.name === "w:pPr") {
    return parsePPr(propElement);
  }
  if (propElement.name === "w:rPr") {
    return parseRPr(propElement);
  }
  // TODO: Add cases for w:tblPr, w:trPr, w:tcPr, etc.

  console.warn(
    `Property parsing not implemented for element: ${propElement.name}`,
  );
  return {};
}

// --- Resource Parsing (Adapted for xast) ---

async function parseStylesXml(
  files: Record<string, Uint8Array>,
): Promise<SharedResources> {
  const stylesPath = "word/styles.xml";
  const resources: SharedResources = {
    styles: {},
    defaults: {},
    abstractNumbering: {},
    numberingInstances: {},
  };
  if (!files[stylesPath]) {
    console.warn("word/styles.xml not found.");
    return resources;
  }
  try {
    const xmlContent = strFromU8(files[stylesPath]);
    const parsedStylesData = fromXml(xmlContent);

    const stylesElement = parsedStylesData.children?.find(
      (node) => node.type === "element" && node.name === "w:styles",
    ) as XastElement | undefined;
    if (!stylesElement) return resources;

    const docDefaultsElement = stylesElement.children?.find(
      (node) => node.type === "element" && node.name === "w:docDefaults",
    ) as XastElement | undefined;
    if (docDefaultsElement) {
      const pPrDefaultContainer = docDefaultsElement.children?.find(
        (node) => node.type === "element" && node.name === "w:pPrDefault",
      ) as XastElement | undefined;
      const pPrDefaultElement = pPrDefaultContainer?.children?.find(
        (node) => node.type === "element" && node.name === "w:pPr",
      ) as XastElement | undefined;
      const rPrDefaultContainer = docDefaultsElement.children?.find(
        (node) => node.type === "element" && node.name === "w:rPrDefault",
      ) as XastElement | undefined;
      const rPrDefaultElement = rPrDefaultContainer?.children?.find(
        (node) => node.type === "element" && node.name === "w:rPr",
      ) as XastElement | undefined;
      resources.defaults = {
        paragraph: parsePPr(pPrDefaultElement),
        run: parseRPr(rPrDefaultElement),
      };
    }

    if (stylesElement.children) {
      for (const node of stylesElement.children) {
        if (node.type === "element" && node.name === "w:style") {
          const styleEl = node as XastElement;
          const styleId = String(styleEl.attributes?.["w:styleId"] || "");
          const type = String(
            styleEl.attributes?.["w:type"] || "",
          ) as SharedStyleDefinition["type"];
          if (!styleId || !type) continue;

          const nameElement = styleEl.children?.find(
            (child) => child.type === "element" && child.name === "w:name",
          ) as XastElement | undefined;
          const basedOnElement = styleEl.children?.find(
            (child) => child.type === "element" && child.name === "w:basedOn",
          ) as XastElement | undefined;
          const pPrElement = styleEl.children?.find(
            (child) => child.type === "element" && child.name === "w:pPr",
          ) as XastElement | undefined;
          const rPrElement = styleEl.children?.find(
            (child) => child.type === "element" && child.name === "w:rPr",
          ) as XastElement | undefined;

          const definition: SharedStyleDefinition = {
            styleId,
            type,
            name: String(nameElement?.attributes?.["w:val"] || ""),
            basedOn: String(basedOnElement?.attributes?.["w:val"] || ""),
            isDefault:
              styleEl.attributes?.["w:default"] === "1" ||
              styleEl.attributes?.["w:default"] === "true",
            paragraphProps: pPrElement ? parsePPr(pPrElement) : undefined,
            runProps: rPrElement ? parseRPr(rPrElement) : undefined,
          };
          if (resources.styles) {
            resources.styles[styleId] = definition;
          }
        }
      }
    }
    console.log("parseStylesXml adapted for xast (basic structure).");
  } catch (error) {
    console.error("Error parsing word/styles.xml with xast:", error);
  }
  return resources;
}

// Helper for parseNumberingXml
function parseNumberingLevel(
  lvlElement: XastElement,
): SharedNumberingLevelDefinition | null {
  if (
    !lvlElement ||
    lvlElement.type !== "element" ||
    lvlElement.name !== "w:lvl"
  )
    return null;
  const ilvlVal = lvlElement.attributes?.["w:ilvl"];
  const level = ilvlVal !== undefined ? Number(ilvlVal) : Number.NaN;
  if (Number.isNaN(level)) return null;

  const definition: SharedNumberingLevelDefinition = { level };
  const startElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:start",
  ) as XastElement | undefined;
  const numFmtElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:numFmt",
  ) as XastElement | undefined;
  const lvlTextElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:lvlText",
  ) as XastElement | undefined;
  const lvlJcElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:lvlJc",
  ) as XastElement | undefined;
  const pPrElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:pPr",
  ) as XastElement | undefined;
  const rPrElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:rPr",
  ) as XastElement | undefined;

  const startVal = startElement?.attributes?.["w:val"];
  if (startVal !== undefined) definition.start = Number(startVal);
  if (numFmtElement?.attributes?.["w:val"])
    definition.format = String(numFmtElement.attributes["w:val"]);
  if (lvlTextElement?.attributes?.["w:val"])
    definition.text = String(lvlTextElement.attributes["w:val"]);
  if (lvlJcElement?.attributes?.["w:val"])
    definition.jc = String(
      lvlJcElement.attributes["w:val"],
    ) as ParagraphFormatting["alignment"];
  if (pPrElement) definition.pPr = parsePPr(pPrElement);
  if (rPrElement) definition.rPr = parseRPr(rPrElement);

  return definition;
}

async function parseNumberingXml(
  files: Record<string, Uint8Array>,
  resources: SharedResources,
): Promise<void> {
  const numberingPath = "word/numbering.xml";
  if (!files[numberingPath]) {
    console.warn("word/numbering.xml not found.");
    return;
  }

  resources.abstractNumbering = {};
  resources.numberingInstances = {};
  const abstractNums = resources.abstractNumbering;
  const numInstances = resources.numberingInstances;

  try {
    const xmlContent = strFromU8(files[numberingPath]);
    const parsedNumberingData = fromXml(xmlContent);
    const numberingElement = parsedNumberingData.children?.find(
      (node) => node.type === "element" && node.name === "w:numbering",
    ) as XastElement | undefined;
    if (!numberingElement || !numberingElement.children) return;

    for (const node of numberingElement.children) {
      if (node.type === "element" && node.name === "w:abstractNum") {
        const abstractNumEl = node as XastElement;
        const abstractNumIdVal = abstractNumEl.attributes?.["w:abstractNumId"];
        const abstractNumId =
          abstractNumIdVal !== undefined ? String(abstractNumIdVal) : "";
        if (!abstractNumId) continue;

        const nameElement = abstractNumEl.children?.find(
          (c) => c.type === "element" && c.name === "w:name",
        ) as XastElement | undefined;
        const multiLevelTypeElement = abstractNumEl.children?.find(
          (c) => c.type === "element" && c.name === "w:multiLevelType",
        ) as XastElement | undefined;

        const definition: SharedAbstractNumDefinition = {
          abstractNumId: abstractNumId,
          name: String(nameElement?.attributes?.["w:val"] || ""),
          multiLevelType: String(
            multiLevelTypeElement?.attributes?.["w:val"] || "",
          ),
          levels: {},
        };

        if (abstractNumEl.children) {
          for (const lvlNode of abstractNumEl.children) {
            if (lvlNode.type === "element" && lvlNode.name === "w:lvl") {
              const levelDef = parseNumberingLevel(lvlNode as XastElement);
              if (levelDef && !Number.isNaN(levelDef.level)) {
                definition.levels[levelDef.level] = levelDef;
              }
            }
          }
        }
        abstractNums[abstractNumId] = definition;
      }
    }

    for (const node of numberingElement.children) {
      if (node.type === "element" && node.name === "w:num") {
        const numInstEl = node as XastElement;
        const numIdVal = numInstEl.attributes?.["w:numId"];
        const abstractNumIdRefEl = numInstEl.children?.find(
          (c) => c.type === "element" && c.name === "w:abstractNumId",
        ) as XastElement | undefined;
        const abstractNumIdRefVal = abstractNumIdRefEl?.attributes?.["w:val"];

        const numId = numIdVal !== undefined ? String(numIdVal) : "";
        const abstractNumIdRef =
          abstractNumIdRefVal !== undefined ? String(abstractNumIdRefVal) : "";
        if (!numId || !abstractNumIdRef) continue;

        const instance: SharedNumInstanceDefinition = {
          numId: numId,
          abstractNumId: abstractNumIdRef,
          levelOverrides: {},
        };

        if (numInstEl.children) {
          const lvlOverrideContainer = numInstEl.children.find(
            (c) => c.type === "element" && c.name === "w:lvlOverride",
          ) as XastElement | undefined;
          if (lvlOverrideContainer?.children) {
            for (const overrideNode of lvlOverrideContainer.children) {
              if (
                overrideNode.type === "element" &&
                overrideNode.name === "w:lvl"
              ) {
                const overrideEl = overrideNode as XastElement;
                const levelIndexVal = overrideEl.attributes?.["w:ilvl"];
                const levelIndex =
                  levelIndexVal !== undefined
                    ? Number(levelIndexVal)
                    : Number.NaN;
                if (Number.isNaN(levelIndex)) continue;

                const levelDefOverride: Partial<SharedNumberingLevelDefinition> =
                  {};
                const startOverrideElement = overrideEl.children?.find(
                  (c) => c.type === "element" && c.name === "w:startOverride",
                ) as XastElement | undefined;
                const lvlElement = overrideEl;

                const startVal = startOverrideElement?.attributes?.["w:val"];
                if (startVal !== undefined) {
                  levelDefOverride.start = Number(startVal);
                }

                const fullLevelOverride = parseNumberingLevel(lvlElement);
                if (fullLevelOverride) {
                  Object.assign(levelDefOverride, fullLevelOverride);
                }

                if (
                  Object.keys(levelDefOverride).length > 0 &&
                  instance.levelOverrides
                ) {
                  instance.levelOverrides[levelIndex] = levelDefOverride;
                }
              }
            }
          }
        }
        numInstances[numId] = instance;
      }
    }
    console.log("parseNumberingXml adapted for xast (basic structure).");
  } catch (error) {
    console.error("Error parsing word/numbering.xml with xast:", error);
  }
}

async function parseRelationshipsXml(
  files: Record<string, Uint8Array>,
): Promise<RelationshipMap> {
  const relsPath = "word/_rels/document.xml.rels";
  const relationships: RelationshipMap = {};
  if (!files[relsPath]) {
    console.warn("word/_rels/document.xml.rels not found.");
    return relationships;
  }

  try {
    const xmlContent = strFromU8(files[relsPath]);
    const relParser = fromXml(xmlContent);
    const relationshipsElement = relParser.children?.find(
      (node) => node.type === "element" && node.name === "Relationships",
    ) as XastElement | undefined;

    if (relationshipsElement?.children) {
      for (const node of relationshipsElement.children) {
        if (node.type === "element" && node.name === "Relationship") {
          const relEl = node as XastElement;
          const id = String(relEl.attributes?.Id || "");
          const type = String(relEl.attributes?.Type || "");
          const target = String(relEl.attributes?.Target || "");
          const targetModeAttr = relEl.attributes?.TargetMode;
          const targetMode = targetModeAttr
            ? String(targetModeAttr)
            : undefined;
          if (id && type && target) {
            relationships[id] = { type, target, targetMode };
          }
        }
      }
    }
    console.log("parseRelationshipsXml adapted for xast.");
  } catch (error) {
    console.error(
      "Error parsing word/_rels/document.xml.rels with xast:",
      error,
    );
  }
  return relationships;
}

// TODO: Adapt parseCommentsXml
async function parseCommentsXml(
  files: Record<string, Uint8Array>,
  relationships: RelationshipMap,
): Promise<Record<string, OoxmlComment> | undefined> {
  console.warn(
    "parseCommentsXml needs rewrite for xast - Returning empty for now.",
  );
  return undefined;
}

// --- Transformation Function (Refactored for XAST) ---

interface TransformContext {
  resources: SharedResources;
  relationships: RelationshipMap;
}

/**
 * Traverses the raw XAST tree from fromXml and adds OOXML specific semantics
 * (like ooxmlType and properties) into the `data` field of nodes.
 * It also performs structural transformations like grouping list items.
 * Returns a new OoxmlRoot node (which still extends XastRoot but has enriched data).
 */
function transformXastToOoxmlAst(
  bodyContentRoot: XastRoot,
  context: TransformContext,
): OoxmlRoot {
  console.warn(
    "transformXastToOoxmlAst needs further implementation and testing.",
  );

  const { resources, relationships } = context;
  const defaultParaProps = resources.defaults?.paragraph || {};
  const defaultRunProps = resources.defaults?.run || {};
  const styles = resources.styles || {};

  // Recursive traversal function to enrich nodes
  function traverse(node: XastNode, parent?: XastElement) {
    if (!node) return;
    if (!node.data) node.data = {};

    if (node.type === "element") {
      const element = node as XastElement;
      const elementName = element.name;
      // @ts-ignore Ensure data is initialized
      node.data.ooxmlType = elementName;

      const propElement = element.children?.find(
        (child) =>
          child.type === "element" &&
          ["w:pPr", "w:rPr", "w:tblPr", "w:trPr", "w:tcPr" /* etc */].includes(
            child.name,
          ),
      ) as XastElement | undefined;

      let directProps: Record<string, any> = {};
      if (propElement) {
        directProps = parseProperties(propElement);
      }

      if (elementName === "w:p") {
        // @ts-ignore
        node.data.ooxmlType = "paragraph";
        const paragraphProps = directProps as ParagraphFormatting;
        const styleId =
          paragraphProps?.styleId || defaultParaProps.styleId || "Normal";
        const resolvedParaStyle = resolveStyleChain(
          styleId,
          styles,
          "paragraph",
        );
        const finalParaProps = mergeProps(
          defaultParaProps,
          resolvedParaStyle,
          paragraphProps,
        );
        finalParaProps.styleId = styleId;
        // @ts-ignore
        node.data.properties = finalParaProps;
      } else if (elementName === "w:r") {
        // @ts-ignore
        node.data.properties = directProps as FontProperties;
      } else if (elementName === "w:t") {
        let finalRunProps: FontProperties = {};
        if (parent && parent.name === "w:r") {
          // @ts-ignore Get props from parent <w:r>
          const parentRunProps =
            (parent.data?.properties as FontProperties) || {};
          // @ts-ignore Find rStyle within the parent rPr props
          const charStyleId = String(parentRunProps.styleId || "");
          const resolvedCharStyle = resolveStyleChain(
            charStyleId || undefined,
            styles,
            "character",
          );
          // TODO: Need paragraph context for para default run props
          const paraDefaultRunProps = {};
          finalRunProps = mergeProps(
            defaultRunProps,
            paraDefaultRunProps,
            resolvedCharStyle,
            parentRunProps,
          );
        }
        // @ts-ignore
        node.data.ooxmlType = "textRun";
        // @ts-ignore
        node.data.properties = finalRunProps;
      } else if (elementName === "w:tbl") {
        // @ts-ignore
        node.data.ooxmlType = "table";
        // @ts-ignore
        node.data.properties = directProps;
      } else if (elementName === "w:tr") {
        // @ts-ignore
        node.data.ooxmlType = "tableRow";
        // @ts-ignore
        node.data.properties = directProps;
      } else if (elementName === "w:tc") {
        // @ts-ignore
        node.data.ooxmlType = "tableCell";
        // @ts-ignore
        node.data.properties = directProps;
      } else if (elementName === "w:hyperlink") {
        // @ts-ignore
        node.data.ooxmlType = "hyperlink";
        const rId = String(element.attributes?.["r:id"] || "");
        const rel = rId ? relationships[rId] : undefined;
        const url =
          rel?.targetMode === "External" ? rel.target : "invalid_link";
        const tooltip = String(element.attributes?.["w:tooltip"] || "");
        const rPrElement = element.children?.find(
          (c) => c.type === "element" && c.name === "w:rPr",
        ) as XastElement | undefined;
        const linkRunProps = parseRPr(rPrElement);
        // @ts-ignore
        node.data.properties = { url, tooltip, ...linkRunProps };
      } else if (elementName === "w:drawing") {
        // Basic find for blip -> embed (can be nested differently)
        let relationId = "";
        function findBlipEmbed(n: XastNode): string | undefined {
          if (n.type === "element") {
            if (n.name === "a:blip" && n.attributes?.["r:embed"]) {
              return String(n.attributes["r:embed"]);
            }
            if (n.children) {
              for (const child of n.children) {
                const found = findBlipEmbed(child);
                if (found) return found;
              }
            }
          }
          return undefined;
        }
        relationId = findBlipEmbed(element) || "";

        // TODO: Extract size/position properties
        // @ts-ignore
        node.data.ooxmlType = "drawing";
        // @ts-ignore
        node.data.properties = { relationId, size: { width: 0, height: 0 } };
      } else if (elementName === "w:br") {
        // @ts-ignore
        node.data.ooxmlType = "break";
        const breakTypeAttr = element.attributes?.["w:type"];
        const breakType = breakTypeAttr ? String(breakTypeAttr) : "line"; // Default to line break
        // @ts-ignore
        node.data.properties = { breakType };
      } else if (elementName === "w:bookmarkStart") {
        // @ts-ignore
        node.data.ooxmlType = "bookmarkStart";
        // @ts-ignore
        node.data.properties = {
          id: String(element.attributes?.["w:id"] || ""),
          name: String(element.attributes?.["w:name"] || ""),
        };
      } else if (elementName === "w:bookmarkEnd") {
        // @ts-ignore
        node.data.ooxmlType = "bookmarkEnd";
        // @ts-ignore
        node.data.properties = {
          id: String(element.attributes?.["w:id"] || ""),
        };
      } else if (elementName === "w:commentReference") {
        // @ts-ignore
        node.data.ooxmlType = "commentReference";
        // @ts-ignore
        node.data.properties = {
          id: String(element.attributes?.["w:id"] || ""),
        };
      }

      // Recursively traverse children
      if (element.children) {
        for (const child of element.children) {
          traverse(child, element);
        }
      }
    } else if (node.type === "text") {
      if (parent && parent.name === "w:r") {
        // @ts-ignore
        node.data.ooxmlType = "textRun";
      } else {
        // @ts-ignore
        node.data.ooxmlType = "orphanText";
      }
    } else if (node.type === "comment") {
      // @ts-ignore
      node.data.ooxmlType = "comment";
    } else if (node.type === "instruction") {
      // @ts-ignore
      node.data.ooxmlType = "instruction";
    }
  }

  // Start traversal
  if (bodyContentRoot.children) {
    for (const child of bodyContentRoot.children) {
      traverse(child, undefined);
    }
  }

  // --- Post-processing: List Grouping ---
  console.warn("List grouping logic needs careful implementation and testing.");
  const processedChildren: OoxmlBlockContent[] = []; // Target type is OoxmlBlockContent[]
  let currentList: OoxmlList | null = null;

  if (bodyContentRoot.children) {
    for (const node of bodyContentRoot.children) {
      let isListItem = false;
      let numberingProps: { level: number; id: string } | undefined = undefined;

      // @ts-ignore Check if it's a paragraph that should be a list item
      if (node.type === "element" && node.data?.ooxmlType === "paragraph") {
        // @ts-ignore
        numberingProps = node.data?.properties?.numbering;
        if (numberingProps) {
          isListItem = true;
        }
      }

      if (isListItem && numberingProps) {
        const abstractNumId =
          resources.numberingInstances?.[numberingProps.id]?.abstractNumId;
        // The list item itself contains the original paragraph node
        const listItem: OoxmlListItem = {
          type: "listItem",
          children: [node as OoxmlParagraph], // Store the original paragraph
          data: {
            ooxmlType: "listItem",
            properties: {
              level: numberingProps.level,
              numId: numberingProps.id,
            },
          },
        };

        if (
          currentList &&
          currentList.data?.properties?.abstractNumId === abstractNumId
        ) {
          currentList.children.push(listItem);
        } else {
          currentList = {
            type: "list",
            children: [listItem],
            data: {
              ooxmlType: "list",
              properties: { numId: numberingProps.id, abstractNumId },
            },
          };
          processedChildren.push(currentList); // Add the new OoxmlList
        }
      } else {
        // Not a list item or end of a list sequence
        currentList = null;
        // Only add nodes that are valid OoxmlBlockContent
        if (node.type === "element") {
          // @ts-ignore Check ooxmlType added during traversal
          const ooxmlType = node.data?.ooxmlType;
          if (
            ooxmlType === "paragraph" ||
            ooxmlType === "table" ||
            ooxmlType === "bookmarkStart" ||
            ooxmlType === "bookmarkEnd"
          ) {
            processedChildren.push(
              node as
                | OoxmlParagraph
                | OoxmlTable
                | OoxmlBookmarkStart
                | OoxmlBookmarkEnd
                | XastElement,
            ); // Cast needed
          } else {
            // Log or ignore other top-level elements like w:sectPr
            // console.warn('Ignoring non-block element at top level:', node.name);
          }
        } else if (node.type === "comment") {
          // Top level comments? Decide if allowed in OoxmlBlockContent
        } else if (node.type === "instruction") {
          // Top level PIs? Decide if allowed
        } // Ignore text, cdata, doctype at top level
      }
    }
  }

  // Create the final OoxmlRoot
  const finalRoot: OoxmlRoot = {
    type: "root",
    children: processedChildren, // Should now match OoxmlBlockContent[]
    data: {
      ...(bodyContentRoot.data || {}),
      ooxmlType: "root",
      metadata: {
        source: "docx-to-ooxml-ast",
        sharedResources: resources,
        relationships: relationships,
        comments: {},
        headerAsts: {},
        footerAsts: {},
      },
    },
  };

  return finalRoot;
}

/**
 * Async Unified plugin for DOCX parsing based on XAST.
 */
export const docxToOoxmlAst: Plugin<[], OoxmlRoot | undefined> = () => {
  return async (
    tree: Node | undefined,
    file: VFile,
  ): Promise<OoxmlRoot | undefined> => {
    console.log("Plugin: docxToOoxmlAst running (XAST-based).");

    // --- 0. Setup & Unzip ---
    if (!file.value || !(file.value instanceof Uint8Array)) {
      file.message(
        new Error("VFile value must be a Uint8Array for OOXML parsing."),
      );
      return undefined;
    }
    let decompressedFiles: Record<string, Uint8Array>;
    try {
      decompressedFiles = await new Promise((resolve, reject) => {
        unzip(file.value as Uint8Array, (err, data) => {
          err ? reject(err) : resolve(data);
        });
      });
      file.data.ooxmlFiles = decompressedFiles;
    } catch (error: unknown) {
      console.error("Error unzipping OOXML file with fflate:", error);
      file.message(
        new Error(
          `fflate unzip failed: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      return undefined;
    }

    // --- 1. Parse Shared Resources ---
    const resources = await parseStylesXml(decompressedFiles);
    await parseNumberingXml(decompressedFiles, resources);
    const relationships = await parseRelationshipsXml(decompressedFiles);

    // --- 2. Parse Main Document XML to XAST ---
    const mainPartPath = "word/document.xml";
    if (!decompressedFiles[mainPartPath]) {
      file.message(
        new Error("Could not locate main document part (word/document.xml)."),
      );
      return undefined;
    }
    const mainXmlContent = strFromU8(decompressedFiles[mainPartPath]);
    let parsedXast: XastRoot;
    try {
      parsedXast = fromXml(mainXmlContent);
      file.data.rawXast = parsedXast;
    } catch (error: unknown) {
      console.error(`Error parsing XML with fromXml (${mainPartPath}):`, error);
      file.message(
        new Error(
          `XML parsing failed with fromXml for ${mainPartPath}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      return undefined;
    }

    // --- 3. Transform Raw XAST into Enriched OOXML AST ---
    const transformContext: TransformContext = { resources, relationships };
    let ooxmlAstRoot: OoxmlRoot;
    try {
      const documentElement = parsedXast.children?.find(
        (node) => node.type === "element" && node.name === "w:document",
      ) as XastElement | undefined;
      const bodyElement = documentElement?.children?.find(
        (node) => node.type === "element" && node.name === "w:body",
      ) as XastElement | undefined;

      if (!bodyElement) {
        console.warn(
          "Could not find expected w:body structure in parsed xast tree.",
        );
        return undefined;
      }

      const bodyContentRoot: XastRoot = {
        type: "root",
        children: bodyElement.children || [],
      };

      ooxmlAstRoot = transformXastToOoxmlAst(bodyContentRoot, transformContext);

      const comments = await parseCommentsXml(decompressedFiles, relationships);

      // --- Safely initialize data and metadata before assignment ---
      // Ensure ooxmlAstRoot.data exists and has the correct type
      if (!ooxmlAstRoot.data) {
        ooxmlAstRoot.data = { ooxmlType: "root" };
      }
      // Ensure ooxmlAstRoot.data.metadata exists
      if (!ooxmlAstRoot.data.metadata) {
        ooxmlAstRoot.data.metadata = {};
      }

      // Assign comments
      ooxmlAstRoot.data.metadata.comments = comments || {};

      // Find and parse section properties (if they exist)
      const finalSectPrElement = bodyElement.children?.find(
        (node) => node.type === "element" && node.name === "w:sectPr",
      ) as XastElement | undefined;
      if (finalSectPrElement) {
        console.warn("Parsing of <w:sectPr> needs implementation.");
        // Example of assignment after parsing:
        // const sectionProps = parseSectPr(finalSectPrElement); // Assuming parseSectPr exists
        // ooxmlAstRoot.data.metadata.sectionProperties = sectionProps;
      }

      // TODO: Parse Headers/Footers and add to metadata

      console.log("OOXML AST transformation completed.");
      return ooxmlAstRoot;
    } catch (transformError: unknown) {
      console.error("Error during Ooxml AST transformation:", transformError);
      file.message(
        new Error(
          `AST transformation failed: ${transformError instanceof Error ? transformError.message : String(transformError)}`,
        ),
      );
      return undefined;
    }
  };
};
