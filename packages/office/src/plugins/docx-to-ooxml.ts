import { strFromU8, unzip } from "fflate";
import type { Plugin } from "unified";
import type { Literal, Node, Parent } from "unist";
import type { VFile } from "vfile";
import type { ElementContent } from "xast";
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
  OoxmlData,
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
import { isOoxmlBlockContent, isOoxmlBreak } from "../ast/type-guards";

// --- Top-level Interfaces & Types ---
// Type for relationship mapping
type RelationshipMap = Record<
  string,
  { type: string; target: string; targetMode?: string }
>;

// Context for transformation functions
interface TransformContext {
  resources: SharedResources;
  relationships: RelationshipMap;
}

// --- Utility Functions ---

// Function to safely get Ooxml properties from data field
function getOoxmlDataProps<T extends XastNode | OoxmlNode>(
  node: T
): Record<string, any> | undefined {
  // Use type assertion to clarify the expected structure of data
  return (node?.data as OoxmlData | undefined)?.properties;
}

// Function to safely get specific Ooxml type from data field
function getOoxmlType<T extends XastNode | OoxmlNode>(
  node: T
): string | undefined {
  // Use type assertion to clarify the expected structure of data
  return (node?.data as OoxmlData | undefined)?.ooxmlType;
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
  depth = 0
): any {
  console.warn(
    "resolveStyleChain needs adaptation for data properties and SharedStyleDefinition structure."
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
    depth + 1
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

  // Font Name
  const rFonts = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:rFonts"
  ) as XastElement | undefined;
  if (rFonts?.attributes) {
    props.name = String(
      rFonts.attributes["w:ascii"] ||
        rFonts.attributes["w:hAnsi"] ||
        rFonts.attributes["w:eastAsia"] ||
        rFonts.attributes["w:cs"] ||
        ""
    );
  }

  // Bold
  const boldElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:b"
  ) as XastElement | undefined;
  if (
    boldElement &&
    boldElement.attributes?.["w:val"] !== "false" &&
    boldElement.attributes?.["w:val"] !== "0"
  ) {
    props.bold = true;
  }

  // Italic
  const italicElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:i"
  ) as XastElement | undefined;
  if (
    italicElement &&
    italicElement.attributes?.["w:val"] !== "false" &&
    italicElement.attributes?.["w:val"] !== "0"
  ) {
    props.italic = true;
  }

  // Underline
  const underlineElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:u"
  ) as XastElement | undefined;
  if (underlineElement?.attributes?.["w:val"]) {
    props.underline = String(
      underlineElement.attributes["w:val"]
    ) as FontProperties["underline"];
  }

  // Strikethrough
  const strikeElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:strike"
  ) as XastElement | undefined;
  if (
    strikeElement &&
    strikeElement.attributes?.["w:val"] !== "false" &&
    strikeElement.attributes?.["w:val"] !== "0"
  ) {
    props.strike = true;
  }
  const dstrikeElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:dstrike"
  ) as XastElement | undefined;
  if (
    dstrikeElement &&
    dstrikeElement.attributes?.["w:val"] !== "false" &&
    dstrikeElement.attributes?.["w:val"] !== "0"
  ) {
    props.doubleStrike = true;
  }

  // Font Size (typically in half-points)
  const szElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:sz"
  ) as XastElement | undefined;
  const szVal = szElement?.attributes?.["w:val"];
  if (szVal !== undefined) {
    const sizeHalfPoints = Number(szVal);
    if (!Number.isNaN(sizeHalfPoints)) {
      props.size = sizeHalfPoints; // Store as half-points for now, may convert later
    }
  }

  // Font Color
  const colorElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:color"
  ) as XastElement | undefined;
  if (
    colorElement?.attributes?.["w:val"] &&
    colorElement.attributes["w:val"] !== "auto"
  ) {
    props.color = String(colorElement.attributes["w:val"]);
    // TODO: Handle theme colors (w:themeColor)
  }

  // Vertical Align (Superscript/Subscript)
  const vertAlignElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:vertAlign"
  ) as XastElement | undefined;
  const vertAlignVal = vertAlignElement?.attributes?.["w:val"];
  if (vertAlignVal === "superscript" || vertAlignVal === "subscript") {
    props.verticalAlign = vertAlignVal;
  }

  // Highlight
  const highlightElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:highlight"
  ) as XastElement | undefined;
  const highlightVal = highlightElement?.attributes?.["w:val"];
  if (highlightVal && highlightVal !== "none") {
    props.highlight = String(highlightVal);
  }

  // Character Style
  const rStyleElement = rPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:rStyle"
  ) as XastElement | undefined;
  if (rStyleElement?.attributes?.["w:val"]) {
    props.styleId = String(rStyleElement.attributes["w:val"]);
  }

  // console.warn("parseRPr needs implementation for ..., etc.");
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

  // Paragraph Style
  const pStyleElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:pStyle"
  ) as XastElement | undefined;
  if (pStyleElement?.attributes?.["w:val"]) {
    props.styleId = String(pStyleElement.attributes["w:val"]);
  }

  // Justification/Alignment
  const jcElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:jc"
  ) as XastElement | undefined;
  if (jcElement?.attributes?.["w:val"]) {
    props.alignment = String(
      jcElement.attributes["w:val"]
    ) as ParagraphFormatting["alignment"];
  }

  // Numbering Properties
  const numPrElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:numPr"
  ) as XastElement | undefined;
  if (numPrElement) {
    const ilvlElement = numPrElement.children?.find(
      (child) => child.type === "element" && child.name === "w:ilvl"
    ) as XastElement | undefined;
    const numIdElement = numPrElement.children?.find(
      (child) => child.type === "element" && child.name === "w:numId"
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

  // Indentation
  const indElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:ind"
  ) as XastElement | undefined;
  if (indElement?.attributes) {
    props.indentation = {};
    if (indElement.attributes.left)
      props.indentation.left = String(indElement.attributes.left);
    if (indElement.attributes.right)
      props.indentation.right = String(indElement.attributes.right);
    if (indElement.attributes.firstLine)
      props.indentation.firstLine = String(indElement.attributes.firstLine);
    if (indElement.attributes.hanging)
      props.indentation.hanging = String(indElement.attributes.hanging);
    // TODO: Consider parsing units (dxa, etc.) into a structured format later
  }

  // Spacing
  const spacingElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:spacing"
  ) as XastElement | undefined;
  if (spacingElement?.attributes) {
    props.spacing = {};
    if (spacingElement.attributes.before)
      props.spacing.before = String(spacingElement.attributes.before);
    if (spacingElement.attributes.after)
      props.spacing.after = String(spacingElement.attributes.after);
    if (spacingElement.attributes.line)
      props.spacing.line = String(spacingElement.attributes.line);
    if (spacingElement.attributes.lineRule) {
      props.spacing.lineRule = String(
        spacingElement.attributes.lineRule
      ) as SpacingProperties["lineRule"];
    }
    // TODO: Consider parsing units (dxa, etc.)
  }

  // Keep Lines / Keep Next / Widow Control / Page Break Before
  const keepNextElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:keepNext"
  ) as XastElement | undefined;
  if (
    keepNextElement &&
    keepNextElement.attributes?.["w:val"] !== "false" &&
    keepNextElement.attributes?.["w:val"] !== "0"
  ) {
    props.keepNext = true;
  }
  const keepLinesElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:keepLines"
  ) as XastElement | undefined;
  if (
    keepLinesElement &&
    keepLinesElement.attributes?.["w:val"] !== "false" &&
    keepLinesElement.attributes?.["w:val"] !== "0"
  ) {
    props.keepLines = true;
  }
  const widowControlElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:widowControl"
  ) as XastElement | undefined;
  if (
    widowControlElement &&
    widowControlElement.attributes?.["w:val"] !== "false" &&
    widowControlElement.attributes?.["w:val"] !== "0"
  ) {
    props.widowControl = true;
  }
  const pageBreakBeforeElement = pPrElement.children?.find(
    (child) => child.type === "element" && child.name === "w:pageBreakBefore"
  ) as XastElement | undefined;
  if (
    pageBreakBeforeElement &&
    pageBreakBeforeElement.attributes?.["w:val"] !== "false" &&
    pageBreakBeforeElement.attributes?.["w:val"] !== "0"
  ) {
    props.pageBreakBefore = true;
  }

  // console.warn("parsePPr needs implementation for borders, fill, etc.");
  return props;
}

// Helper to parse <w:tblPr>
function parseTblPr(
  tblPrElement: XastElement | undefined
): Record<string, any> {
  // Basic placeholder - add actual parsing logic as needed
  if (
    !tblPrElement ||
    tblPrElement.type !== "element" ||
    tblPrElement.name !== "w:tblPr"
  )
    return {};
  console.log("Parsing w:tblPr (basic)...");
  // Example: Parse table style
  const tblStyle = tblPrElement.children?.find(
    (c) => c.type === "element" && c.name === "w:tblStyle"
  ) as XastElement | undefined;
  return {
    styleId: tblStyle?.attributes?.["w:val"]
      ? String(tblStyle.attributes["w:val"])
      : undefined,
    // Add other table properties here
  };
}

// Helper to parse <w:trPr>
function parseTrPr(trPrElement: XastElement | undefined): Record<string, any> {
  // Basic placeholder
  if (
    !trPrElement ||
    trPrElement.type !== "element" ||
    trPrElement.name !== "w:trPr"
  )
    return {};
  console.log("Parsing w:trPr (basic)...");
  return {};
}

// Helper to parse <w:tcPr>
function parseTcPr(tcPrElement: XastElement | undefined): Record<string, any> {
  // Basic placeholder
  if (
    !tcPrElement ||
    tcPrElement.type !== "element" ||
    tcPrElement.name !== "w:tcPr"
  )
    return {};
  console.log("Parsing w:tcPr (basic)...");
  // Example: Parse vertical alignment
  const vAlign = tcPrElement.children?.find(
    (c) => c.type === "element" && c.name === "w:vAlign"
  ) as XastElement | undefined;
  return {
    verticalAlign: vAlign?.attributes?.["w:val"]
      ? String(vAlign.attributes["w:val"])
      : undefined,
    // Add other cell properties here
  };
}

// Generic property parser
function parseProperties(
  propElement: XastElement | undefined
): Record<string, any> {
  if (!propElement || propElement.type !== "element") return {};

  if (propElement.name === "w:pPr") {
    return parsePPr(propElement);
  }
  if (propElement.name === "w:rPr") {
    return parseRPr(propElement);
  }
  // TODO: Add cases for w:tblPr, w:trPr, w:tcPr, etc.
  if (propElement.name === "w:tblPr") {
    return parseTblPr(propElement);
  }
  if (propElement.name === "w:trPr") {
    return parseTrPr(propElement);
  }
  if (propElement.name === "w:tcPr") {
    return parseTcPr(propElement);
  }

  console.warn(
    `Property parsing not implemented for element: ${propElement.name}`
  );
  return {};
}

// --- Resource Parsing (Adapted for xast) ---

async function parseStylesXml(
  files: Record<string, Uint8Array>
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
      (node) => node.type === "element" && node.name === "w:styles"
    ) as XastElement | undefined;
    if (!stylesElement) return resources;

    const docDefaultsElement = stylesElement.children?.find(
      (node) => node.type === "element" && node.name === "w:docDefaults"
    ) as XastElement | undefined;
    if (docDefaultsElement) {
      const pPrDefaultContainer = docDefaultsElement.children?.find(
        (node) => node.type === "element" && node.name === "w:pPrDefault"
      ) as XastElement | undefined;
      const pPrDefaultElement = pPrDefaultContainer?.children?.find(
        (node) => node.type === "element" && node.name === "w:pPr"
      ) as XastElement | undefined;
      const rPrDefaultContainer = docDefaultsElement.children?.find(
        (node) => node.type === "element" && node.name === "w:rPrDefault"
      ) as XastElement | undefined;
      const rPrDefaultElement = rPrDefaultContainer?.children?.find(
        (node) => node.type === "element" && node.name === "w:rPr"
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
            styleEl.attributes?.["w:type"] || ""
          ) as SharedStyleDefinition["type"];
          if (!styleId || !type) continue;

          const nameElement = styleEl.children?.find(
            (child) => child.type === "element" && child.name === "w:name"
          ) as XastElement | undefined;
          const basedOnElement = styleEl.children?.find(
            (child) => child.type === "element" && child.name === "w:basedOn"
          ) as XastElement | undefined;
          const pPrElement = styleEl.children?.find(
            (child) => child.type === "element" && child.name === "w:pPr"
          ) as XastElement | undefined;
          const rPrElement = styleEl.children?.find(
            (child) => child.type === "element" && child.name === "w:rPr"
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
  lvlElement: XastElement
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
    (c) => c.type === "element" && c.name === "w:start"
  ) as XastElement | undefined;
  const numFmtElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:numFmt"
  ) as XastElement | undefined;
  const lvlTextElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:lvlText"
  ) as XastElement | undefined;
  const lvlJcElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:lvlJc"
  ) as XastElement | undefined;
  const pPrElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:pPr"
  ) as XastElement | undefined;
  const rPrElement = lvlElement.children?.find(
    (c) => c.type === "element" && c.name === "w:rPr"
  ) as XastElement | undefined;

  const startVal = startElement?.attributes?.["w:val"];
  if (startVal !== undefined) definition.start = Number(startVal);
  if (numFmtElement?.attributes?.["w:val"])
    definition.format = String(numFmtElement.attributes["w:val"]);
  if (lvlTextElement?.attributes?.["w:val"])
    definition.text = String(lvlTextElement.attributes["w:val"]);
  if (lvlJcElement?.attributes?.["w:val"])
    definition.jc = String(
      lvlJcElement.attributes["w:val"]
    ) as ParagraphFormatting["alignment"];
  if (pPrElement) definition.pPr = parsePPr(pPrElement);
  if (rPrElement) definition.rPr = parseRPr(rPrElement);

  return definition;
}

async function parseNumberingXml(
  files: Record<string, Uint8Array>,
  resources: SharedResources
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
      (node) => node.type === "element" && node.name === "w:numbering"
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
          (c) => c.type === "element" && c.name === "w:name"
        ) as XastElement | undefined;
        const multiLevelTypeElement = abstractNumEl.children?.find(
          (c) => c.type === "element" && c.name === "w:multiLevelType"
        ) as XastElement | undefined;

        const definition: SharedAbstractNumDefinition = {
          abstractNumId: abstractNumId,
          name: String(nameElement?.attributes?.["w:val"] || ""),
          multiLevelType: String(
            multiLevelTypeElement?.attributes?.["w:val"] || ""
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
          (c) => c.type === "element" && c.name === "w:abstractNumId"
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
            (c) => c.type === "element" && c.name === "w:lvlOverride"
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
                  (c) => c.type === "element" && c.name === "w:startOverride"
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
  files: Record<string, Uint8Array>
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
      (node) => node.type === "element" && node.name === "Relationships"
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
      error
    );
  }
  return relationships;
}

// --- Comment Parsing (Adapted for XAST) ---
async function parseCommentsXml(
  files: Record<string, Uint8Array>,
  context: TransformContext // Pass the full context for traverse
): Promise<Record<string, OoxmlComment>> {
  const commentsPath = "word/comments.xml";
  const commentsMap: Record<string, OoxmlComment> = {};
  if (!files[commentsPath]) {
    console.warn("word/comments.xml not found.");
    return commentsMap;
  }

  try {
    const xmlContent = strFromU8(files[commentsPath]);
    const parsedCommentsData = fromXml(xmlContent);
    const commentsRootElement = parsedCommentsData.children?.find(
      (node) => node.type === "element" && node.name === "w:comments"
    ) as XastElement | undefined;

    if (!commentsRootElement?.children) return commentsMap;

    const commentEls = commentsRootElement.children.filter(
      (node): node is XastElement =>
        node.type === "element" && node.name === "w:comment"
    );

    console.error(`Found ${commentEls.length} w:comment elements.`); // New log 1

    for (const commentEl of commentEls) {
      // Changed from forEach for clarity
      const idVal = commentEl.attributes?.["w:id"];
      const id = idVal !== undefined ? String(idVal) : "";
      if (!id) continue;

      const author = String(commentEl.attributes?.["w:author"] || "");
      const initials = String(commentEl.attributes?.["w:initials"] || "");
      const dateStr = String(commentEl.attributes?.["w:date"] || "");
      // Note: date parsing can be complex due to potential timezone issues
      // const date = dateStr ? new Date(dateStr) : undefined; // Basic parsing

      const commentChildren: OoxmlBlockContent[] = [];
      if (commentEl.children && commentEl.children.length > 0) {
        for (const childNode of commentEl.children) {
          const processedNode = traverse(childNode, context, commentEl);

          if (Array.isArray(processedNode)) {
            commentChildren.push(
              ...(processedNode.filter(
                isOoxmlBlockContent
              ) as OoxmlBlockContent[])
            );
          } else if (processedNode && isOoxmlBlockContent(processedNode)) {
            commentChildren.push(processedNode as OoxmlBlockContent);
          }
        }
      }

      const commentData: OoxmlComment = {
        type: "comment",
        id: id,
        author: author,
        initials: initials,
        date: dateStr, // Store as string for now
        children: commentChildren, // Assign the processed children
      };
      commentsMap[id] = commentData;
    }
    console.log(
      `Parsed ${Object.keys(commentsMap).length} comments from comments.xml`
    );
  } catch (error) {
    console.error("Error parsing word/comments.xml with xast:", error);
  }
  return commentsMap;
}

// --- Standalone Traverse Function ---
/**
 * Recursively traverses an XAST node, enriching it with OOXML semantics
 * and transforming its structure based on the context.
 */
function traverse(
  node: XastNode,
  context: TransformContext, // Added context parameter
  parent?: XastElement
): XastNode | XastNode[] | null {
  if (!node) return null;

  // Ensure data object exists
  if (!node.data) {
    node.data = {};
  }
  const nodeData = node.data as OoxmlData;

  // Extract context needed within traverse
  const { resources, relationships } = context;
  const defaultParaProps = resources.defaults?.paragraph || {};
  const defaultRunProps = resources.defaults?.run || {};
  const styles = resources.styles || {};

  if (node.type === "element") {
    const element = node as XastElement;
    const elementName = element.name;
    nodeData.ooxmlType = elementName; // Initial assignment

    // --- Property Parsing ---
    let directProps: Record<string, any> = {};
    const propElement = element.children?.find(
      (child) =>
        child.type === "element" &&
        ["w:pPr", "w:rPr", "w:tblPr", "w:trPr", "w:tcPr"].includes(child.name)
    ) as XastElement | undefined;

    if (propElement) {
      directProps = parseProperties(propElement);
    }

    // --- Element-Specific Logic & Typing ---
    if (elementName === "w:p") {
      nodeData.ooxmlType = "paragraph";
      const paragraphProps = directProps as ParagraphFormatting;
      const styleId =
        paragraphProps?.styleId || defaultParaProps.styleId || "Normal";
      const resolvedParaStyle = resolveStyleChain(styleId, styles, "paragraph");
      const finalParaProps = mergeProps(
        defaultParaProps,
        resolvedParaStyle,
        paragraphProps
      );
      finalParaProps.styleId = styleId;
      nodeData.properties = finalParaProps;
    } else if (elementName === "w:r") {
      // Handle w:r - Enrich the node, process children, keep w:r structure
      nodeData.ooxmlType = "run"; // Mark as a run container
      // Explicitly capture properties for THIS run element
      const currentRunDirectProps = parseProperties(
        element.children?.find(
          (c) => c.type === "element" && c.name === "w:rPr"
        ) as XastElement | undefined
      ) as FontProperties;
      // Store direct properties on the run node itself for potential later use/reference
      // The final effective properties are on the OoxmlTextRun children.
      nodeData.properties = currentRunDirectProps;

      const newChildren: XastNode[] = [];

      if (element.children) {
        for (const child of element.children) {
          if (child.type === "element" && child.name === "w:t") {
            const tValue = xastToString(child);
            // Style Resolution
            let parentParaProps: ParagraphFormatting | undefined;
            if (
              parent &&
              (parent.data as OoxmlData | undefined)?.ooxmlType === "paragraph"
            ) {
              parentParaProps = (parent.data as OoxmlData)
                .properties as ParagraphFormatting;
            }
            const charStyleId = currentRunDirectProps.styleId; // Use props from THIS run
            const resolvedCharStyle = resolveStyleChain(
              charStyleId || undefined,
              styles,
              "character"
            );
            const paraStyleId =
              parentParaProps?.styleId || defaultParaProps.styleId || "Normal";
            const resolvedParaStyleForRun = resolveStyleChain(
              paraStyleId,
              styles,
              "paragraph"
            );
            const paraDefaultRunProps = resolvedParaStyleForRun?.runProps || {};

            // Ensure merge starts clean and uses only properties relevant to this specific w:t context
            const finalRunProps = mergeProps(
              defaultRunProps,
              paraDefaultRunProps,
              resolvedCharStyle,
              currentRunDirectProps // Explicitly use properties derived ONLY from this run's <w:rPr>
            );

            const textRunNode: OoxmlTextRun = {
              type: "text", // Use 'text' type, but data identifies it as OoxmlTextRun
              value: tValue,
              data: { ooxmlType: "textRun", properties: finalRunProps },
            };
            newChildren.push(textRunNode);
          } else if (child.type === "element" && child.name === "w:br") {
            const processedChild = traverse(child, context, element); // Pass context
            if (processedChild) {
              // traverse for w:br should return a single enriched node
              if (!Array.isArray(processedChild)) {
                newChildren.push(processedChild);
              } else {
                console.warn(
                  "Traverse returned an array for w:br, expected single node."
                );
                newChildren.push(...processedChild); // Handle unexpected array
              }
            }
          } else if (child.type === "element" && child.name === "w:rPr") {
            // Skip rPr element itself - properties already captured in currentRunDirectProps
          } else if (
            child.type === "element" ||
            child.type === "text" ||
            child.type === "instruction" ||
            child.type === "comment"
          ) {
            // Handle other potential inline elements like drawing, symbols etc.
            const currentChild = child as ElementContent; // Cast needed?
            const processedChild = traverse(currentChild, context, element); // Pass context
            if (processedChild) {
              // Traverse for other inline elements might return single node or array
              if (Array.isArray(processedChild)) {
                newChildren.push(...processedChild);
              } else {
                newChildren.push(processedChild);
              }
            }
          }
        }
      }
      // Replace the original children with the processed ones (e.g., w:t -> OoxmlTextRun)
      element.children = newChildren as ElementContent[];
      // Return the enriched w:r node itself, not the children
      // return element; // Fall through to default return
    } else if (elementName === "w:t") {
      // Orphan w:t found outside w:r - log and remove
      nodeData.ooxmlType = "orphanText";
      console.warn("Encountered w:t element outside of w:r context:", element);
      return null;
    } else if (elementName === "w:tbl") {
      nodeData.ooxmlType = "table";
      nodeData.properties = directProps;
    } else if (elementName === "w:tr") {
      nodeData.ooxmlType = "tableRow";
      nodeData.properties = directProps;
    } else if (elementName === "w:tc") {
      nodeData.ooxmlType = "tableCell";
      nodeData.properties = directProps;
    } else if (elementName === "w:hyperlink") {
      nodeData.ooxmlType = "hyperlink";
      const rId = String(element.attributes?.["r:id"] || "");
      const rel = rId ? relationships[rId] : undefined;
      const url = rel?.targetMode === "External" ? rel.target : `rels://${rId}`;
      const tooltip = String(element.attributes?.["w:tooltip"] || "");
      nodeData.properties = { url, tooltip };
      (nodeData as any).url = url;
    } else if (elementName === "w:drawing") {
      nodeData.ooxmlType = "drawing";
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
      nodeData.properties = { relationId, size: { width: 0, height: 0 } };
      (nodeData as any).relationId = relationId;
    } else if (elementName === "w:br") {
      nodeData.ooxmlType = "break";
      const breakTypeAttr = element.attributes?.["w:type"];
      const breakType = breakTypeAttr ? String(breakTypeAttr) : "line";
      nodeData.properties = { breakType };
    } else if (elementName === "w:bookmarkStart") {
      nodeData.ooxmlType = "bookmarkStart";
      nodeData.properties = {
        id: String(element.attributes?.["w:id"] || ""),
        name: String(element.attributes?.["w:name"] || ""),
      };
    } else if (elementName === "w:bookmarkEnd") {
      nodeData.ooxmlType = "bookmarkEnd";
      nodeData.properties = {
        id: String(element.attributes?.["w:id"] || ""),
      };
    } else if (elementName === "w:commentReference") {
      nodeData.ooxmlType = "commentReference";
      nodeData.properties = {
        id: String(element.attributes?.["w:id"] || ""),
      };
    }

    // --- Child Traversal (for elements NOT early returning like w:r) ---
    if (element.children) {
      const originalChildren = [...element.children];
      const newChildren: ElementContent[] = [];
      for (const child of originalChildren) {
        // Skip property elements
        if (
          child.type === "element" &&
          [
            "w:pPr",
            "w:rPr",
            "w:tblPr",
            "w:trPr",
            "w:tcPr",
            "w:sectPr",
          ].includes(child.name)
        ) {
          continue;
        }
        // Skip the specific property element already parsed for this node
        if (child === propElement) {
          continue;
        }

        const processedChild = traverse(child, context, element); // Pass context

        if (processedChild) {
          if (Array.isArray(processedChild)) {
            newChildren.push(...(processedChild as ElementContent[]));
          } else {
            newChildren.push(processedChild as ElementContent);
          }
        }
      }
      element.children = newChildren;
    }
    // Fall through to return the modified element node
  } else if (node.type === "text") {
    // Handle loose text nodes if necessary (e.g., mark as orphan)
    // nodeData.ooxmlType = "orphanText";
    return node; // Return text node as is
  } else if (node.type === "comment") {
    nodeData.ooxmlType = "comment"; // XML comment, not OOXML logical comment
    return node;
  } else if (node.type === "instruction") {
    nodeData.ooxmlType = "instruction";
    return node;
  }

  // Return the processed node by default
  return node;
}

// --- Transformation Function (Main Entry Point) ---
/**
 * Transforms the raw XAST tree (from document body) into an enriched OOXML AST,
 * handling structure like list grouping.
 */
function transformXastToOoxmlAst(
  bodyContentRoot: XastRoot,
  context: TransformContext // Context is passed in
): OoxmlRoot {
  console.warn(
    "transformXastToOoxmlAst needs further implementation and testing."
  );

  // Start traversal of the main body content
  if (bodyContentRoot.children) {
    // Use a temporary array for new children as traverse might modify the array in place
    const initialChildren = [...bodyContentRoot.children];
    const traversedChildren: XastNode[] = [];
    for (const child of initialChildren) {
      const processed = traverse(child, context, undefined); // Call standalone traverse
      if (processed) {
        if (Array.isArray(processed)) {
          traversedChildren.push(...processed);
        } else {
          traversedChildren.push(processed);
        }
      }
    }
    bodyContentRoot.children = traversedChildren as ElementContent[]; // Update root with traversed children
  }

  // --- Post-processing: List Grouping & Top-Level Element Filtering ---
  console.warn("List grouping logic needs careful implementation and testing.");
  const processedChildren: OoxmlBlockContent[] = [];
  let currentList: OoxmlList | null = null;

  if (bodyContentRoot.children) {
    for (const node of bodyContentRoot.children) {
      if (node.type !== "element") continue;

      let isListItem = false;
      let numberingProps: { level: number; id: string } | undefined = undefined;

      const nodeData = node.data as OoxmlData | undefined;
      if (nodeData?.ooxmlType === "paragraph") {
        const paragraphProps = nodeData.properties as
          | ParagraphFormatting
          | undefined;
        const potentialNumbering = paragraphProps?.numbering;
        if (
          potentialNumbering?.id !== undefined &&
          potentialNumbering?.level !== undefined
        ) {
          numberingProps = {
            level: potentialNumbering.level,
            id: String(potentialNumbering.id),
          };
          isListItem = true;
        }
      }

      if (isListItem && numberingProps) {
        const abstractNumId =
          context.resources.numberingInstances?.[numberingProps.id]
            ?.abstractNumId;
        const listItem: OoxmlListItem = {
          type: "listItem",
          children:
            nodeData?.ooxmlType === "paragraph" ? [node as OoxmlParagraph] : [],
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
          currentList.data?.properties?.numId === numberingProps.id
        ) {
          currentList.children.push(listItem);
        } else {
          if (currentList) processedChildren.push(currentList);
          currentList = {
            type: "list",
            children: [listItem],
            data: {
              ooxmlType: "list",
              properties: { numId: numberingProps.id, abstractNumId },
            },
          };
        }
      } else {
        if (currentList) {
          processedChildren.push(currentList);
          currentList = null;
        }
        // Add other valid block-level Ooxml nodes
        if (
          ["w:p", "w:tbl", "w:bookmarkStart", "w:bookmarkEnd"].includes(
            node.name
          )
        ) {
          // Basic check, push potentially OoxmlBlockContent compatible nodes
          // More robust type checking might be needed based on exact OoxmlBlockContent definition
          processedChildren.push(node as OoxmlBlockContent);
        } else {
          console.warn(`Skipping non-block element at top level: ${node.name}`);
        }
      }
    }
    if (currentList) processedChildren.push(currentList);
  }

  // --- Final Root Construction ---
  const finalRoot: OoxmlRoot = {
    type: "root",
    children: processedChildren, // Use the list-grouped and filtered children
    data: {
      ooxmlType: "root",
      metadata: {
        relationships: context.relationships,
        numbering: {
          instances: context.resources.numberingInstances,
          abstracts: context.resources.abstractNumbering,
        },
        styles: context.resources.styles,
        comments: undefined, // Comments will be added later by the main plugin function
      },
    },
  };

  console.log("OOXML AST transformation completed.");
  return finalRoot;
}

/**
 * Async Unified plugin for DOCX parsing based on XAST.
 */
export const docxToOoxmlAst: Plugin<[], OoxmlRoot | undefined> = () => {
  return async (
    tree: Node | undefined,
    file: VFile
  ): Promise<OoxmlRoot | undefined> => {
    console.log("Plugin: docxToOoxmlAst running (XAST-based).");

    // --- 0. Setup & Unzip ---
    if (!file.value || !(file.value instanceof Uint8Array)) {
      file.message(
        new Error("VFile value must be a Uint8Array for OOXML parsing.")
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
          `fflate unzip failed: ${error instanceof Error ? error.message : String(error)}`
        )
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
        new Error("Could not locate main document part (word/document.xml).")
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
          `XML parsing failed with fromXml for ${mainPartPath}: ${error instanceof Error ? error.message : String(error)}`
        )
      );
      return undefined;
    }

    // --- 3. Transform Raw XAST into Enriched OOXML AST ---
    const transformContext: TransformContext = { resources, relationships }; // Now visible
    let ooxmlAstRoot: OoxmlRoot;
    try {
      const documentElement = parsedXast.children?.find(
        (node) => node.type === "element" && node.name === "w:document"
      ) as XastElement | undefined;
      const bodyElement = documentElement?.children?.find(
        (node) => node.type === "element" && node.name === "w:body"
      ) as XastElement | undefined;

      if (!bodyElement) {
        console.warn(
          "Could not find expected w:body structure in parsed xast tree."
        );
        return undefined;
      }

      const bodyContentRoot: XastRoot = {
        type: "root",
        children: bodyElement.children || [],
      };

      // Call the main transformation function
      ooxmlAstRoot = transformXastToOoxmlAst(bodyContentRoot, transformContext);

      // Parse comments using the same context AFTER main body transformation
      const comments = await parseCommentsXml(
        decompressedFiles,
        transformContext
      );

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
        (node) => node.type === "element" && node.name === "w:sectPr"
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
          `AST transformation failed: ${transformError instanceof Error ? transformError.message : String(transformError)}`
        )
      );
      return undefined;
    }
  };
};
