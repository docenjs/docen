import { defu } from "defu";
import { strFromU8, unzip } from "fflate";
import type { Plugin } from "unified";
import { is } from "unist-util-is";
import { CONTINUE, EXIT, SKIP, visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { fromXml } from "xast-util-from-xml";
import type {
  BorderStyleProperties,
  ColorDefinition,
  FontProperties,
  IndentationProperties,
  Measurement,
  MeasurementOrAuto,
  MeasurementOrPercent,
  MeasurementUnit,
  NumberingProperties,
  OnOffValue,
  OoxmlData,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlNode,
  OoxmlRoot,
  OoxmlRootData,
  OoxmlText,
  ParagraphBorderProperties,
  ParagraphFormatting,
  RelationshipMap,
  ShadingProperties,
  SharedAbstractNumDefinition,
  SharedCommentDefinition,
  SharedNumInstanceDefinition,
  SharedNumberingLevelDefinition,
  SharedResources,
  SharedStyleDefinition,
  SpacingProperties,
  TabStop,
  TableBorderProperties,
  WmlBookmarkEndProperties,
  WmlBookmarkStartProperties,
  WmlBreakProperties,
  WmlCommentRefProperties,
  WmlHyperlinkProperties,
  WmlSmartTagProperties,
  WmlTableCellProperties,
  WmlTableProperties,
  WmlTableRowProperties,
} from "../ast";
// Import shared types
import type { FromDocxOptions } from "../types";

// --- Helper Functions (Define BEFORE first use) ---

function getAttribute(
  element: OoxmlElement | undefined,
  attrName: string,
): string | undefined {
  return element?.attributes?.[attrName]
    ? String(element.attributes[attrName])
    : undefined;
}

function parseOnOff(value: string | undefined): OnOffValue | undefined {
  // If the tag exists but value is undefined, it typically means 'true' or 'on'
  if (value === undefined) return true;
  if (value === "true" || value === "1" || value === "on") return true;
  if (value === "false" || value === "0" || value === "off") return false;
  return undefined; // Return undefined for other values
}

function parseMeasurement(
  value: string | undefined,
  defaultUnit: MeasurementUnit = "dxa",
): Measurement | undefined {
  if (value === undefined) return undefined;
  if (value === "auto") return undefined;

  // Handle explicit unit suffixes in the value string
  const unitSuffixes = {
    pt: "pt",
    in: "in",
    cm: "cm",
    mm: "mm",
    px: "pt", // Convert pixels to points (approximation)
    em: "pt", // Convert em to points (approximation, assumes 12pt base)
    "%": "pct",
  } as const;

  for (const [suffix, unit] of Object.entries(unitSuffixes)) {
    if (value.endsWith(suffix)) {
      const numValue = Number.parseFloat(value.slice(0, -suffix.length));
      if (!Number.isNaN(numValue)) {
        // Special conversions
        if (suffix === "px") {
          return { value: numValue * 0.75, unit: "pt" }; // 1px ≈ 0.75pt
        }
        if (suffix === "em") {
          return { value: numValue * 12, unit: "pt" }; // Assume 12pt base font
        }
        if (suffix === "%") {
          return { value: numValue, unit: "pct" };
        }
        return { value: numValue, unit: unit as MeasurementUnit };
      }
    }
  }

  // No explicit unit found, try parsing as number with default unit
  const num = Number.parseInt(value, 10);
  if (!Number.isNaN(num)) {
    return { value: num, unit: defaultUnit };
  }

  return undefined;
}

function parseColor(
  colorElement: OoxmlElement | undefined,
): ColorDefinition | undefined {
  if (!colorElement) return undefined;
  const value = getAttribute(colorElement, "w:val");
  const themeColor = getAttribute(colorElement, "w:themeColor");
  const themeTint = getAttribute(colorElement, "w:themeTint");
  const themeShade = getAttribute(colorElement, "w:themeShade");
  const definition: ColorDefinition = {};
  if (value && value !== "auto") definition.value = value;
  if (themeColor) definition.themeColor = themeColor;
  if (themeTint) definition.themeTint = Number.parseInt(themeTint, 16) / 255; // Example conversion
  if (themeShade) definition.themeShade = Number.parseInt(themeShade, 16) / 255; // Example conversion
  return Object.keys(definition).length > 0 ? definition : undefined;
}

function parseUnderline(
  uElement: OoxmlElement | undefined,
): FontProperties["underline"] {
  if (!uElement) return undefined;
  const style = getAttribute(uElement, "w:val");
  const colorChild = uElement.children?.find(
    (c) => is(c, "element") && c.name === "w:color",
  ) as OoxmlElement | undefined;
  const color = parseColor(colorChild);
  if (!style || style === "none") return undefined;
  const underlineProp: { style?: string; color?: ColorDefinition } = { style };
  if (color) underlineProp.color = color;
  return underlineProp;
}

// --- Implemented Parsing Helpers ---
function parseIndentation(
  indElement: OoxmlElement | undefined,
): IndentationProperties | undefined {
  if (!indElement || !is(indElement, { name: "w:ind" })) return undefined;
  const props: IndentationProperties = {};

  const left = getAttribute(indElement, "w:left");
  if (left) props.left = parseMeasurement(left, "dxa");

  const right = getAttribute(indElement, "w:right");
  if (right) props.right = parseMeasurement(right, "dxa");

  const hanging = getAttribute(indElement, "w:hanging");
  if (hanging) props.hanging = parseMeasurement(hanging, "dxa");

  const firstLine = getAttribute(indElement, "w:firstLine");
  if (firstLine) props.firstLine = parseMeasurement(firstLine, "dxa");

  return Object.keys(props).length > 0 ? props : undefined;
}

function parseSpacing(
  spacingElement: OoxmlElement | undefined,
): SpacingProperties | undefined {
  if (!spacingElement || !is(spacingElement, { name: "w:spacing" }))
    return undefined;
  const props: SpacingProperties = {};

  const before = getAttribute(spacingElement, "w:before");
  if (before) props.before = parseMeasurement(before, "dxa");

  const after = getAttribute(spacingElement, "w:after");
  if (after) props.after = parseMeasurement(after, "dxa");

  const line = getAttribute(spacingElement, "w:line");
  if (line) props.line = parseMeasurement(line, "dxa");

  const lineRule = getAttribute(spacingElement, "w:lineRule");
  if (lineRule) props.lineRule = lineRule as SpacingProperties["lineRule"];

  return Object.keys(props).length > 0 ? props : undefined;
}

function parseShading(
  shdElement: OoxmlElement | undefined,
): ShadingProperties | undefined {
  if (!shdElement || !is(shdElement, { name: "w:shd" })) return undefined;
  const props: ShadingProperties = {};

  const val = getAttribute(shdElement, "w:val");
  if (val) props.pattern = val as ShadingProperties["pattern"];

  const color = getAttribute(shdElement, "w:color");
  if (color && color !== "auto") props.color = { value: color };

  const fill = getAttribute(shdElement, "w:fill");
  if (fill && fill !== "auto") props.fillColor = { value: fill };

  return Object.keys(props).length > 0 ? props : undefined;
}

function parseBorders(
  bdrElement: OoxmlElement | undefined,
): TableBorderProperties | ParagraphBorderProperties | undefined {
  if (!bdrElement) return undefined;
  const borders: Record<string, BorderStyleProperties> = {};

  for (const child of bdrElement.children || []) {
    if (!is(child, "element")) continue;

    let borderType: string | undefined;
    switch (child.name) {
      case "w:top":
        borderType = "top";
        break;
      case "w:bottom":
        borderType = "bottom";
        break;
      case "w:left":
        borderType = "left";
        break;
      case "w:right":
        borderType = "right";
        break;
      case "w:insideH":
        borderType = "insideH";
        break;
      case "w:insideV":
        borderType = "insideV";
        break;
      case "w:between":
        borderType = "between";
        break;
      case "w:bar":
        borderType = "bar";
        break;
    }

    if (borderType) {
      const borderStyle: BorderStyleProperties = {};

      const val = getAttribute(child, "w:val");
      if (val && val !== "none") borderStyle.style = val;

      const sz = getAttribute(child, "w:sz");
      if (sz)
        borderStyle.size = { value: Number.parseInt(sz, 10) / 8, unit: "pt" }; // sz is in eighths of a point

      const color = getAttribute(child, "w:color");
      if (color && color !== "auto") borderStyle.color = { value: color };

      const space = getAttribute(child, "w:space");
      if (space)
        borderStyle.space = { value: Number.parseInt(space, 10), unit: "pt" };

      if (Object.keys(borderStyle).length > 0) {
        borders[borderType] = borderStyle;
      }
    }
  }

  return Object.keys(borders).length > 0
    ? (borders as TableBorderProperties)
    : undefined;
}

function parseTabs(
  tabsElement: OoxmlElement | undefined,
): TabStop[] | undefined {
  if (!tabsElement || !is(tabsElement, { name: "w:tabs" })) return undefined;
  const tabs: TabStop[] = [];

  for (const child of tabsElement.children || []) {
    if (is(child, "element") && child.name === "w:tab") {
      const tabElement = child as OoxmlElement;

      const val = getAttribute(tabElement, "w:val");
      const pos = getAttribute(tabElement, "w:pos");
      const leader = getAttribute(tabElement, "w:leader");

      const position = parseMeasurement(pos, "dxa");
      const alignment = (val as TabStop["alignment"]) || "left";

      if (position) {
        const tab: TabStop = {
          position,
          alignment,
        };

        if (leader) {
          tab.leader = leader as TabStop["leader"];
        }

        tabs.push(tab);
      }
    }
  }

  return tabs.length > 0 ? tabs : undefined;
}
function parseTableLayout(
  layoutElement: OoxmlElement | undefined,
): WmlTableProperties["layout"] {
  if (!layoutElement || !is(layoutElement, { name: "w:tblLayout" }))
    return undefined;
  const type = getAttribute(layoutElement, "w:type");
  return type === "fixed" || type === "autofit" ? type : undefined;
}

function parseCellMargins(
  marElement: OoxmlElement | undefined,
): WmlTableCellProperties["margins"] {
  if (!marElement || !is(marElement, { name: "w:tcMar" })) return undefined;
  const margins: WmlTableCellProperties["margins"] = {};

  for (const child of marElement.children || []) {
    if (!is(child, "element")) continue;

    let marginType:
      | keyof NonNullable<WmlTableCellProperties["margins"]>
      | undefined;
    switch (child.name) {
      case "w:top":
        marginType = "top";
        break;
      case "w:bottom":
        marginType = "bottom";
        break;
      case "w:left":
        marginType = "left";
        break;
      case "w:right":
        marginType = "right";
        break;
    }

    if (marginType) {
      const w = getAttribute(child as OoxmlElement, "w:w");
      const type = getAttribute(child as OoxmlElement, "w:type");
      if (w) {
        margins[marginType] = parseMeasurement(
          w,
          type === "dxa" ? "dxa" : "pt",
        );
      }
    }
  }

  return Object.keys(margins).length > 0 ? margins : undefined;
}

function parseHeight(
  heightElement: OoxmlElement | undefined,
): Measurement | undefined {
  if (!heightElement || !is(heightElement, { name: "w:trHeight" }))
    return undefined;
  const val = getAttribute(heightElement, "w:val");
  return val ? parseMeasurement(val, "dxa") : undefined;
}

function parseWidth(
  widthElement: OoxmlElement | undefined,
): MeasurementOrPercent | MeasurementOrAuto | undefined {
  if (!widthElement) return undefined;
  const w = getAttribute(widthElement, "w:w");
  const type = getAttribute(widthElement, "w:type");

  if (w === "auto") return "auto";
  if (!w) return undefined;

  const numValue = Number.parseInt(w, 10);
  if (Number.isNaN(numValue)) return undefined;

  switch (type) {
    case "pct":
      return { value: numValue / 50, unit: "pct" }; // OOXML percentage is in 50ths of a percent
    case "dxa":
      return { value: numValue, unit: "dxa" };
    case "auto":
      return "auto";
    default:
      return { value: numValue, unit: "dxa" }; // Default to dxa
  }
}

function parseVAlign(
  valignElement: OoxmlElement | undefined,
): WmlTableCellProperties["verticalAlign"] {
  if (!valignElement || !is(valignElement, { name: "w:vAlign" }))
    return undefined;
  const val = getAttribute(valignElement, "w:val");
  return val === "top" || val === "center" || val === "bottom"
    ? val
    : undefined;
}

// Context for transformation functions
interface TransformContext {
  resources: SharedResources;
  relationships: RelationshipMap;
  customHandlers?: Record<
    string,
    (element: OoxmlElement, context: TransformContext) => unknown
  >;
}

// Define a type for resolved style properties
interface ResolvedStyleProperties {
  [key: string]: unknown;
}

// Resolve a style chain by walking up basedOn relationships
function resolveStyleChain(
  styleId: string | undefined,
  styles: Record<string, SharedStyleDefinition> | undefined,
  type: "paragraph" | "character",
  depth = 0,
): ResolvedStyleProperties {
  if (!styleId || !styles?.[styleId] || depth > 10) {
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
  if (type === "paragraph" && style.paragraphProperties) {
    currentStyleProps = style.paragraphProperties;
  } else if (type === "character" && style.runProperties) {
    currentStyleProps = style.runProperties;
  } else if (
    type === "character" &&
    style.type === "paragraph" &&
    style.runProperties
  ) {
    // Paragraph style might define default run properties
    currentStyleProps = style.runProperties;
  }

  return defu(currentStyleProps, baseStyleProps);
}

// Helper to parse <w:rPr> into FontProperties
function parseRPr(rPrElement: OoxmlElement | undefined): FontProperties {
  if (!rPrElement || !is(rPrElement, { name: "w:rPr" })) return {};
  const props: FontProperties = {};

  for (const child of rPrElement.children || []) {
    if (!is(child, "element")) continue;

    switch (child.name) {
      case "w:rFonts":
        props.name = String(
          getAttribute(child, "w:ascii") ||
            getAttribute(child, "w:hAnsi") ||
            getAttribute(child, "w:eastAsia") ||
            getAttribute(child, "w:cs") ||
            "",
        );
        break;
      case "w:b":
        props.bold = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:i":
        props.italic = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:u":
        props.underline = parseUnderline(child);
        break;
      case "w:strike":
        props.strike = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:dstrike":
        props.doubleStrike = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:sz":
      case "w:szCs": {
        // Consider complex script size too
        const szVal = getAttribute(child, "w:val");
        const szMeasure = parseMeasurement(szVal, "pt"); // size is in half-points
        if (szMeasure) props.size = szMeasure;
        break;
      }
      case "w:color":
        props.color = parseColor(child);
        break;
      case "w:vertAlign": {
        const vertAlignVal = getAttribute(child, "w:val");
        if (vertAlignVal === "superscript" || vertAlignVal === "subscript") {
          props.vertAlign = vertAlignVal;
        }
        break;
      }
      case "w:highlight": {
        const highlightVal = getAttribute(child, "w:val");
        if (highlightVal && highlightVal !== "none")
          props.highlight = highlightVal;
        break;
      }
      case "w:rStyle": {
        const styleId = getAttribute(child, "w:val");
        if (styleId) props.styleId = styleId;
        break;
      }
      case "w:spacing":
        props.spacing = parseMeasurement(getAttribute(child, "w:val"), "dxa");
        break;
      case "w:kern": {
        const kernVal = getAttribute(child, "w:val");
        const kernHalfPoints = kernVal
          ? Number.parseInt(kernVal, 10)
          : Number.NaN;
        if (!Number.isNaN(kernHalfPoints)) {
          props.kerning = { value: kernHalfPoints / 2, unit: "pt" };
        }
        break;
      }
      case "w:position": {
        const posVal = getAttribute(child, "w:val");
        const posHalfPoints = posVal ? Number.parseInt(posVal, 10) : Number.NaN;
        if (!Number.isNaN(posHalfPoints)) {
          props.position = { value: posHalfPoints / 2, unit: "pt" };
        }
        break;
      }
    }
  }
  return props;
}

// Helper to parse <w:pPr> into ParagraphFormatting
function parsePPr(pPrElement: OoxmlElement | undefined): ParagraphFormatting {
  if (!pPrElement || !is(pPrElement, { name: "w:pPr" })) return {};
  const props: ParagraphFormatting = {};

  for (const child of pPrElement.children || []) {
    if (!is(child, "element")) continue;

    switch (child.name) {
      case "w:pStyle": {
        const styleId = getAttribute(child, "w:val");
        if (styleId) props.styleId = styleId;
        break;
      }
      case "w:jc": {
        const alignVal = getAttribute(child, "w:val");
        if (alignVal)
          props.alignment = alignVal as ParagraphFormatting["alignment"];
        break;
      }
      case "w:numPr":
        if (is(child, "element")) {
          const ilvlElement = child.children?.find((c): c is OoxmlElement =>
            is(c, { name: "w:ilvl" }),
          ) as OoxmlElement | undefined;
          const numIdElement = child.children?.find((c): c is OoxmlElement =>
            is(c, { name: "w:numId" }),
          ) as OoxmlElement | undefined;
          const ilvlVal = getAttribute(ilvlElement, "w:val");
          const numIdVal = getAttribute(numIdElement, "w:val");
          if (ilvlVal !== undefined && numIdVal !== undefined) {
            const level = Number(ilvlVal);
            if (!Number.isNaN(level)) {
              props.numbering = { level: level, id: numIdVal };
            }
          }
        }
        break;
      case "w:ind":
        props.indentation = parseIndentation(child);
        break;
      case "w:spacing":
        props.spacing = parseSpacing(child);
        break;
      case "w:shd":
        props.shading = parseShading(child);
        break;
      case "w:pBdr":
        props.borders = parseBorders(child);
        break;
      case "w:tabs":
        props.tabs = parseTabs(child);
        break;
      case "w:keepNext":
        props.keepNext = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:keepLines":
        props.keepLines = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:widowControl":
        props.widowControl = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:pageBreakBefore":
        props.pageBreakBefore =
          parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:rPr": // Default run properties for the paragraph
        props.runProperties = parseRPr(child);
        break;
    }
  }
  return props;
}

// Helper to parse <w:tblPr> into WmlTableProperties
function parseTblPr(
  tblPrElement: OoxmlElement | undefined,
): WmlTableProperties {
  if (!tblPrElement || !is(tblPrElement, { name: "w:tblPr" })) return {};
  const props: WmlTableProperties = {};

  for (const child of tblPrElement.children || []) {
    if (!is(child, "element")) continue;
    switch (child.name) {
      case "w:tblStyle":
        props.styleId = getAttribute(child, "w:val");
        break;
      case "w:tblW":
        props.width = parseWidth(child);
        break;
      case "w:jc":
        props.alignment = getAttribute(
          child,
          "w:val",
        ) as WmlTableProperties["alignment"];
        break;
      case "w:tblInd":
        props.indentation = parseMeasurement(getAttribute(child, "w:w"), "dxa");
        break;
      case "w:tblBorders":
        props.borders = parseBorders(child) as TableBorderProperties;
        break;
      case "w:shd":
        props.shading = parseShading(child);
        break;
      case "w:tblLayout":
        props.layout = parseTableLayout(child);
        break;
      case "w:tblCellMar":
        props.cellMargins = parseCellMargins(child);
        break;
      case "w:tblCellSpacing":
        props.cellSpacing = parseMeasurement(
          getAttribute(child, "w:val"),
          "dxa",
        );
        break;
      case "w:tblLook":
        props.look = getAttribute(child, "w:val");
        break;
    }
  }
  return props;
}

// Helper to parse <w:trPr> into WmlTableRowProperties
function parseTrPr(
  trPrElement: OoxmlElement | undefined,
): WmlTableRowProperties {
  if (!trPrElement || !is(trPrElement, { name: "w:trPr" })) return {};
  const props: WmlTableRowProperties = {};
  for (const child of trPrElement.children || []) {
    if (!is(child, "element")) continue;
    switch (child.name) {
      case "w:trHeight": {
        props.height = parseHeight(child);
        const hRule = getAttribute(child, "w:hRule");
        if (hRule === "auto" || hRule === "atLeast" || hRule === "exact") {
          props.heightRule = hRule;
        }
        break;
      }
      case "w:cantSplit":
        props.cantSplit = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:tblHeader":
        props.isHeader = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
      case "w:vAlign": {
        const vAlign = getAttribute(child, "w:val");
        if (vAlign === "top" || vAlign === "center" || vAlign === "bottom") {
          props.cellAlignment = vAlign;
        }
        break;
      }
    }
  }
  return props;
}

// Helper to parse <w:tcPr> into WmlTableCellProperties
function parseTcPr(
  tcPrElement: OoxmlElement | undefined,
): WmlTableCellProperties {
  if (!tcPrElement || !is(tcPrElement, { name: "w:tcPr" })) return {};
  const props: WmlTableCellProperties = {};
  for (const child of tcPrElement.children || []) {
    if (!is(child, "element")) continue;
    switch (child.name) {
      case "w:tcW":
        props.width = parseWidth(child);
        break;
      case "w:tcBorders":
        props.borders = parseBorders(child) as TableBorderProperties;
        break;
      case "w:shd":
        props.shading = parseShading(child);
        break;
      case "w:tcMar":
        props.margins = parseCellMargins(child);
        break;
      case "w:vAlign":
        props.verticalAlign = parseVAlign(child);
        break;
      case "w:textDirection":
        props.textDirection = getAttribute(
          child,
          "w:val",
        ) as WmlTableCellProperties["textDirection"];
        break;
      case "w:gridSpan": {
        const span = getAttribute(child, "w:val");
        if (span) props.gridSpan = Number.parseInt(span, 10);
        break;
      }
      case "w:vMerge":
        props.vMerge = getAttribute(
          child,
          "w:val",
        ) as WmlTableCellProperties["vMerge"];
        break;
      case "w:noWrap":
        props.noWrap = parseOnOff(getAttribute(child, "w:val")) ?? true;
        break;
    }
  }
  return props;
}

// --- Resource Parsing (Adapted for xast -> Ooxml*) ---

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
    const parsedStylesData = fromXml(xmlContent) as OoxmlRoot;

    const stylesElement = parsedStylesData.children?.find(
      (node): node is OoxmlElement => is(node, { name: "w:styles" }),
    );
    if (!stylesElement) return resources;

    const docDefaultsElement = stylesElement.children?.find(
      (node): node is OoxmlElement => is(node, { name: "w:docDefaults" }),
    );
    if (docDefaultsElement) {
      const pPrDefaultContainer = docDefaultsElement.children?.find(
        (node): node is OoxmlElement => is(node, { name: "w:pPrDefault" }),
      );
      const pPrDefaultElement = pPrDefaultContainer?.children?.find(
        (node): node is OoxmlElement => is(node, { name: "w:pPr" }),
      );
      const rPrDefaultContainer = docDefaultsElement.children?.find(
        (node): node is OoxmlElement => is(node, { name: "w:rPrDefault" }),
      );
      const rPrDefaultElement = rPrDefaultContainer?.children?.find(
        (node): node is OoxmlElement => is(node, { name: "w:rPr" }),
      );
      resources.defaults = {
        paragraph: parsePPr(pPrDefaultElement),
        run: parseRPr(rPrDefaultElement),
      };
    }

    if (stylesElement.children) {
      for (const node of stylesElement.children) {
        if (is(node, { name: "w:style" })) {
          const styleEl = node as OoxmlElement;
          const styleId = getAttribute(styleEl, "w:styleId") || "";
          const type =
            (getAttribute(
              styleEl,
              "w:type",
            ) as SharedStyleDefinition["type"]) || "";
          if (!styleId || !type) continue;

          const nameElement = styleEl.children?.find(
            (child): child is OoxmlElement => is(child, { name: "w:name" }),
          );
          const basedOnElement = styleEl.children?.find(
            (child): child is OoxmlElement => is(child, { name: "w:basedOn" }),
          );
          const pPrElement = styleEl.children?.find(
            (child): child is OoxmlElement => is(child, { name: "w:pPr" }),
          );
          const rPrElement = styleEl.children?.find(
            (child): child is OoxmlElement => is(child, { name: "w:rPr" }),
          );

          const definition: SharedStyleDefinition = {
            styleId,
            type,
            name: nameElement ? getAttribute(nameElement, "w:val") || "" : "",
            basedOn: basedOnElement
              ? getAttribute(basedOnElement, "w:val") || ""
              : "",
            isDefault: parseOnOff(getAttribute(styleEl, "w:default")) === true,
            paragraphProperties: pPrElement ? parsePPr(pPrElement) : undefined,
            runProperties: rPrElement ? parseRPr(rPrElement) : undefined,
          };
          if (resources.styles) {
            resources.styles[styleId] = definition;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error parsing word/styles.xml with xast:", error);
  }
  return resources;
}

// Helper for parseNumberingXml (Use OoxmlElement)
function parseNumberingLevel(
  lvlElement: OoxmlElement | undefined,
): SharedNumberingLevelDefinition | null {
  if (!lvlElement || !is(lvlElement, { name: "w:lvl" })) return null;

  const ilvlVal = getAttribute(lvlElement, "w:ilvl");
  const level = ilvlVal !== undefined ? Number(ilvlVal) : Number.NaN;
  if (Number.isNaN(level)) return null;

  const definition: SharedNumberingLevelDefinition = { level };
  const startElement = lvlElement.children?.find((c): c is OoxmlElement =>
    is(c, { name: "w:start" }),
  );
  const numFmtElement = lvlElement.children?.find((c): c is OoxmlElement =>
    is(c, { name: "w:numFmt" }),
  );
  const lvlTextElement = lvlElement.children?.find((c): c is OoxmlElement =>
    is(c, { name: "w:lvlText" }),
  );
  const lvlJcElement = lvlElement.children?.find((c): c is OoxmlElement =>
    is(c, { name: "w:lvlJc" }),
  );
  const pPrElement = lvlElement.children?.find((c): c is OoxmlElement =>
    is(c, { name: "w:pPr" }),
  );
  const rPrElement = lvlElement.children?.find((c): c is OoxmlElement =>
    is(c, { name: "w:rPr" }),
  );

  if (startElement) {
    const startVal = getAttribute(startElement, "w:val");
    if (startVal !== undefined) definition.start = Number(startVal);
  }
  if (numFmtElement) {
    const numFmtVal = getAttribute(numFmtElement, "w:val");
    if (numFmtVal) definition.format = numFmtVal;
  }
  if (lvlTextElement) {
    const lvlTextVal = getAttribute(lvlTextElement, "w:val");
    if (lvlTextVal) definition.text = lvlTextVal;
  }
  if (lvlJcElement) {
    const lvlJcVal = getAttribute(lvlJcElement, "w:val");
    if (lvlJcVal) definition.jc = lvlJcVal as ParagraphFormatting["alignment"];
  }
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
    const parsedNumberingData = fromXml(xmlContent) as OoxmlRoot;
    const numberingElement = parsedNumberingData.children?.find(
      (node): node is OoxmlElement => is(node, { name: "w:numbering" }),
    );
    if (!numberingElement || !numberingElement.children) return;

    for (const node of numberingElement.children) {
      if (is(node, { name: "w:abstractNum" })) {
        const abstractNumEl = node as OoxmlElement;
        const abstractNumIdVal = getAttribute(abstractNumEl, "w:abstractNumId");
        const abstractNumId = abstractNumIdVal || "";
        if (!abstractNumId) continue;

        const nameElement = abstractNumEl.children?.find(
          (c): c is OoxmlElement => is(c, { name: "w:name" }),
        );
        const multiLevelTypeElement = abstractNumEl.children?.find(
          (c): c is OoxmlElement => is(c, { name: "w:multiLevelType" }),
        );

        const definition: SharedAbstractNumDefinition = {
          abstractNumId: abstractNumId,
          name: nameElement ? getAttribute(nameElement, "w:val") || "" : "",
          multiLevelType: multiLevelTypeElement
            ? getAttribute(multiLevelTypeElement, "w:val") || ""
            : "",
          levels: {},
        };

        if (abstractNumEl.children) {
          for (const lvlNode of abstractNumEl.children) {
            if (is(lvlNode, { name: "w:lvl" })) {
              const levelDef = parseNumberingLevel(lvlNode as OoxmlElement);
              if (levelDef && !Number.isNaN(levelDef.level)) {
                definition.levels[levelDef.level] = levelDef;
              }
            }
          }
        }
        if (abstractNums) {
          abstractNums[abstractNumId] = definition;
        }
      }
    }

    for (const node of numberingElement.children) {
      if (is(node, { name: "w:num" })) {
        const numInstEl = node as OoxmlElement;
        const numIdVal = getAttribute(numInstEl, "w:numId");
        const abstractNumIdRefEl = numInstEl.children?.find(
          (c): c is OoxmlElement => is(c, { name: "w:abstractNumId" }),
        );
        const abstractNumIdRefVal = getAttribute(abstractNumIdRefEl, "w:val");

        const numId = numIdVal || "";
        const abstractNumIdRef = abstractNumIdRefVal || "";
        if (!numId || !abstractNumIdRef) continue;

        const instance: SharedNumInstanceDefinition = {
          numId: numId,
          abstractNumId: abstractNumIdRef,
          levelOverrides: {},
        };

        if (numInstEl.children) {
          const lvlOverrideContainer = numInstEl.children.find(
            (c): c is OoxmlElement => is(c, { name: "w:lvlOverride" }),
          );
          if (lvlOverrideContainer?.children) {
            for (const overrideNode of lvlOverrideContainer.children) {
              if (is(overrideNode, { name: "w:lvl" })) {
                const overrideEl = overrideNode as OoxmlElement;
                const levelIndexVal = getAttribute(overrideEl, "w:ilvl");
                const levelIndex =
                  levelIndexVal !== undefined
                    ? Number(levelIndexVal)
                    : Number.NaN;
                if (Number.isNaN(levelIndex)) continue;

                const levelDefOverride: Partial<SharedNumberingLevelDefinition> =
                  {};
                const startOverrideElement = overrideEl.children?.find(
                  (c): c is OoxmlElement => is(c, { name: "w:startOverride" }),
                );
                const lvlElement = overrideEl; // Refers to the <w:lvl> inside override

                const startVal = startOverrideElement
                  ? getAttribute(startOverrideElement, "w:val")
                  : undefined;
                if (startVal !== undefined) {
                  // Type for startOverride is different, handle carefully
                  // We might need a different structure or field.
                  // For now, let's assume start can be overridden.
                  levelDefOverride.start = Number(startVal);
                }

                // Parse the rest of the <w:lvl> as potential overrides
                const fullLevelOverride = parseNumberingLevel(lvlElement);
                if (fullLevelOverride) {
                  Object.assign(levelDefOverride, fullLevelOverride);
                }

                if (
                  Object.keys(levelDefOverride).length > 0 &&
                  instance.levelOverrides
                ) {
                  // Add the startOverride value if present
                  if (startVal !== undefined) {
                    // This assumes SharedNumberingLevelDefinition can hold startOverride
                    // Need to verify/adjust SharedNumInstanceDefinition structure if necessary
                    (
                      levelDefOverride as Record<string, unknown>
                    ).startOverride = Number(startVal);
                  }
                  instance.levelOverrides[levelIndex] = levelDefOverride;
                }
              }
            }
          }
        }
        numInstances[numId] = instance;
      }
    }
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
    const relParser = fromXml(xmlContent) as OoxmlRoot;
    const relationshipsElement = relParser.children?.find(
      (node): node is OoxmlElement => is(node, { name: "Relationships" }),
    );

    if (relationshipsElement?.children) {
      for (const node of relationshipsElement.children) {
        if (is(node, { name: "Relationship" })) {
          const relEl = node as OoxmlElement;
          const id = getAttribute(relEl, "Id") || "";
          const type = getAttribute(relEl, "Type") || "";
          const target = getAttribute(relEl, "Target") || "";
          const targetModeAttr = getAttribute(relEl, "TargetMode");
          // Fix Linter Error L791: Ensure targetMode is one of the allowed literals or undefined
          const targetMode =
            targetModeAttr === "External" || targetModeAttr === "Internal"
              ? targetModeAttr
              : undefined;

          if (id && type && target) {
            // Assuming RelationshipMap value type matches { type: string; target: string; targetMode?: 'External' | 'Internal' }
            relationships[id] = { id, type, target, targetMode };
          }
        }
      }
    }
  } catch (error) {
    console.error(
      "Error parsing word/_rels/document.xml.rels with xast:",
      error,
    );
  }
  return relationships;
}

// --- Comment Parsing (Use OoxmlElement, SharedCommentDefinition) ---
async function parseCommentsXml(
  files: Record<string, Uint8Array>,
  context: TransformContext,
): Promise<Record<string, SharedCommentDefinition>> {
  // Return SharedCommentDefinition
  const commentsPath = "word/comments.xml";
  const commentsMap: Record<string, SharedCommentDefinition> = {};
  if (!files[commentsPath]) return commentsMap;

  try {
    const xmlContent = strFromU8(files[commentsPath]);
    const parsedCommentsData = fromXml(xmlContent) as OoxmlRoot;
    const commentsRootElement = parsedCommentsData.children?.find(
      (node): node is OoxmlElement => is(node, { name: "w:comments" }),
    );
    if (!commentsRootElement?.children) return commentsMap;

    const commentEls = commentsRootElement.children.filter(
      (node): node is OoxmlElement => is(node, { name: "w:comment" }),
    );

    for (const commentEl of commentEls) {
      const id = getAttribute(commentEl, "w:id") || "";
      if (!id) continue;
      const author = getAttribute(commentEl, "w:author");
      const initials = getAttribute(commentEl, "w:initials");
      const dateStr = getAttribute(commentEl, "w:date");

      // Use visit to process children instead of manual traversal
      const commentChildren: OoxmlElementContent[] = [];
      // Temporarily using map for structure, visit is better for side effects
      visit(commentEl, (node) => {
        if (node !== commentEl) {
          // Avoid processing the root comment element itself here
          // Here, node is OoxmlNode from visit
          if (
            is(node, ["element", "text", "comment", "instruction", "cdata"])
          ) {
            // We need to enrich this node similar to the main traversal
            // This requires passing context and handling recursively, or a simplified enrichment
            // For now, just push the compatible node type (enrichment missing)
            commentChildren.push(node as OoxmlElementContent);
            return SKIP; // Avoid traversing children of pushed nodes here?
          }
        }
        return CONTINUE;
      });

      commentsMap[id] = {
        id: id,
        author: author,
        initials: initials,
        date: dateStr,
        children: commentChildren, // Content needs enrichment
      };
    }
  } catch (error) {
    console.error("Error parsing comments.xml:", error);
  }
  return commentsMap;
}

// --- List Grouping Function (Modified to operate on parentElement.children) ---
function groupListItems(
  parentElement: OoxmlElement,
  context: TransformContext,
): void {
  const groupedChildren: OoxmlElementContent[] = [];
  let currentListElement: OoxmlElement | null = null;

  // Operate on the children of the passed parent element (e.g., w:body)
  for (const node of parentElement.children || []) {
    let isListItemParagraph = false;
    let numberingProps: NumberingProperties | undefined = undefined;

    if (
      is(node, "element") &&
      (node.data as OoxmlData | undefined)?.ooxmlType === "paragraph"
    ) {
      const paragraphProps = (node.data as OoxmlData)?.properties as
        | ParagraphFormatting
        | undefined;
      if (paragraphProps?.numbering) {
        numberingProps = paragraphProps.numbering;
        isListItemParagraph = true;
      }
    }

    if (isListItemParagraph && numberingProps) {
      const abstractNumId =
        context.resources.numberingInstances?.[numberingProps.id]
          ?.abstractNumId;

      const listItemElement: OoxmlElement = {
        type: "element",
        name: "listItem", // Abstract name
        attributes: {},
        children: [node], // Contains the original paragraph element
        data: {
          ooxmlType: "listItem",
          properties: { level: numberingProps.level, numId: numberingProps.id },
        },
      };

      // Add explicit type annotation for currentListNumId and simplify access
      const currentListData: OoxmlData | undefined =
        currentListElement?.data as OoxmlData | undefined;
      const currentListNumId: string | undefined = currentListData
        ? ((currentListData.properties as Record<string, unknown>)?.numId as
            | string
            | undefined)
        : undefined;

      if (currentListNumId === numberingProps.id) {
        if (currentListElement)
          currentListElement.children.push(listItemElement);
      } else {
        if (currentListElement) groupedChildren.push(currentListElement);
        currentListElement = {
          type: "element",
          name: "list", // Abstract name
          attributes: {},
          children: [listItemElement],
          data: {
            ooxmlType: "list",
            properties: { numId: numberingProps.id, abstractNumId },
          },
        };
      }
    } else {
      if (currentListElement) {
        groupedChildren.push(currentListElement);
        currentListElement = null;
      }
      // Add node if it's a valid content type (already filtered in visit? No, this is post-visit)
      if (is(node, ["element", "text", "comment", "instruction", "cdata"])) {
        groupedChildren.push(node);
      }
    }
  }
  if (currentListElement) groupedChildren.push(currentListElement);

  // Replace parent element's children with the grouped list
  parentElement.children = groupedChildren;
}

// --- Main Transformation Function using visit --- //
function transformXastToOoxmlAst(
  root: OoxmlRoot,
  context: TransformContext,
): void {
  const { resources, relationships } = context;
  const { styles, defaults } = resources;
  const defaultParaProps = defaults?.paragraph || {};
  const defaultRunProps = defaults?.run || {};

  // Store current paragraph and section context
  let currentParagraphProps: ParagraphFormatting | undefined = undefined;
  let currentSectionProps: Record<string, unknown> | undefined = undefined;

  visit(root, (node, index, parent) => {
    if (!node.data) node.data = {};
    const nodeData = node.data as OoxmlData;
    const parentElement = is(parent, "element") ? parent : undefined;

    if (is(node, "element")) {
      const element = node;
      const tagName = element.name;

      // Handle document structure elements
      if (tagName === "w:document") {
        nodeData.ooxmlType = "document";
        return CONTINUE;
      }

      if (tagName === "w:body") {
        nodeData.ooxmlType = "body";
        return CONTINUE;
      }

      if (tagName === "w:sectPr") {
        nodeData.ooxmlType = "sectionProperties";
        // Parse section properties
        const sectProps = parseSectionProperties(element);
        nodeData.properties = sectProps;
        currentSectionProps = sectProps;
        return CONTINUE;
      }

      // Handle paragraph elements
      if (tagName === "w:p") {
        const propElement = element.children?.find(
          (child) => is(child, "element") && child.name === "w:pPr",
        ) as OoxmlElement | undefined;

        const directProps = parsePPr(propElement);
        nodeData.ooxmlType = "paragraph";

        const styleId =
          directProps?.styleId || defaultParaProps.styleId || "Normal";
        const resolvedParaStyle = resolveStyleChain(
          styleId,
          styles,
          "paragraph",
        );
        const finalParaProps = defu(
          directProps,
          resolvedParaStyle,
          defaultParaProps,
        ) as ParagraphFormatting;
        finalParaProps.styleId = styleId;

        nodeData.properties = finalParaProps;
        currentParagraphProps = finalParaProps;
      }

      if (tagName === "w:r") {
        const propElement = element.children?.find(
          (child) => is(child, "element") && child.name === "w:rPr",
        ) as OoxmlElement | undefined;

        const directProps = parseRPr(propElement);
        nodeData.ooxmlType = "textRun";

        // Resolve character style
        const runStyleId = directProps?.styleId;
        const paraStyleId = currentParagraphProps?.styleId || "Normal";

        const resolvedCharStyle = resolveStyleChain(
          runStyleId,
          styles,
          "character",
        );
        const resolvedParaStyleForRun = resolveStyleChain(
          paraStyleId,
          styles,
          "paragraph",
        );
        const paraDefaultRunProps =
          (resolvedParaStyleForRun?.runProperties as Record<string, unknown>) ||
          {};

        const finalRunProps = defu(
          directProps,
          resolvedCharStyle,
          paraDefaultRunProps,
          defaultRunProps,
        ) as FontProperties;

        nodeData.properties = finalRunProps;
      }

      if (tagName === "w:t") {
        nodeData.ooxmlType = "textContentWrapper";
      }

      if (tagName === "w:br") {
        nodeData.ooxmlType = "break";
        const breakType = getAttribute(element, "w:type");
        const clear = getAttribute(element, "w:clear");
        const breakProps: WmlBreakProperties = {
          breakType:
            breakType === "page" ||
            breakType === "column" ||
            breakType === "textWrapping"
              ? breakType
              : undefined,
          clear:
            clear === "none" ||
            clear === "left" ||
            clear === "right" ||
            clear === "all"
              ? clear
              : undefined,
        };
        nodeData.properties = breakProps;
      }

      if (tagName === "w:tab") {
        nodeData.ooxmlType = "tabChar";
      }

      if (tagName === "w:softHyphen") {
        nodeData.ooxmlType = "softHyphen";
      }

      if (tagName === "w:noBreakHyphen") {
        nodeData.ooxmlType = "noBreakHyphen";
      }

      if (tagName === "w:sym") {
        nodeData.ooxmlType = "symbol";
        nodeData.properties = {
          charCode: getAttribute(element, "w:char") || "",
          font: getAttribute(element, "w:font") || "",
        };
      }

      // Handle table elements
      if (tagName === "w:tbl") {
        const propElement = element.children?.find(
          (child) => is(child, "element") && child.name === "w:tblPr",
        ) as OoxmlElement | undefined;

        nodeData.ooxmlType = "table";
        nodeData.properties = parseTblPr(propElement);
      }

      if (tagName === "w:tr") {
        const propElement = element.children?.find(
          (child) => is(child, "element") && child.name === "w:trPr",
        ) as OoxmlElement | undefined;

        nodeData.ooxmlType = "tableRow";
        nodeData.properties = parseTrPr(propElement);
      }

      if (tagName === "w:tc") {
        const propElement = element.children?.find(
          (child) => is(child, "element") && child.name === "w:tcPr",
        ) as OoxmlElement | undefined;

        nodeData.ooxmlType = "tableCell";
        nodeData.properties = parseTcPr(propElement);
      }

      if (tagName === "w:tblGrid") {
        nodeData.ooxmlType = "tableGrid";
      }

      if (tagName === "w:gridCol") {
        nodeData.ooxmlType = "tableGridCol";
        nodeData.properties = {
          width: parseMeasurement(getAttribute(element, "w:w"), "dxa"),
        };
      }

      // Handle hyperlinks and references
      if (tagName === "w:hyperlink") {
        nodeData.ooxmlType = "hyperlink";
        const rId = getAttribute(element, "r:id") || "";
        const anchor = getAttribute(element, "w:anchor") || "";
        const rel = rId ? relationships[rId] : undefined;

        const hyperlinkProps: WmlHyperlinkProperties = {
          relationId: rId,
          url: rel?.targetMode === "External" ? rel.target : undefined,
          anchor:
            anchor ||
            (rel?.targetMode !== "External" ? rel?.target : undefined),
          tooltip: getAttribute(element, "w:tooltip") || "",
        };
        nodeData.properties = hyperlinkProps;
      }

      if (tagName === "w:bookmarkStart") {
        nodeData.ooxmlType = "bookmarkStart";
        const bookmarkProps: WmlBookmarkStartProperties = {
          id: getAttribute(element, "w:id") || "",
          bookmarkName: getAttribute(element, "w:name") || "",
        };
        nodeData.properties = bookmarkProps;
      }

      if (tagName === "w:bookmarkEnd") {
        nodeData.ooxmlType = "bookmarkEnd";
        const bookmarkEndProps: WmlBookmarkEndProperties = {
          id: getAttribute(element, "w:id") || "",
        };
        nodeData.properties = bookmarkEndProps;
      }

      // Handle drawing and media elements
      if (tagName === "w:drawing") {
        nodeData.ooxmlType = "drawing";
        let embedId: string | undefined;
        let fileName: string | undefined;

        // Search for embedded image references
        visit(element, (child) => {
          if (is(child, "element")) {
            if (
              is(child, { name: "a:blip" }) &&
              child.attributes?.["r:embed"]
            ) {
              embedId = String(child.attributes["r:embed"]);
              return EXIT;
            }
            if (
              is(child, { name: "v:imagedata" }) &&
              child.attributes?.["r:id"]
            ) {
              embedId = String(child.attributes["r:id"]);
              return EXIT;
            }
          }
          return CONTINUE;
        });

        const rel = embedId ? relationships[embedId] : undefined;
        if (rel) fileName = rel.target;

        nodeData.properties = { relationId: embedId, fileName };
      }

      if (tagName === "w:pict") {
        nodeData.ooxmlType = "picture";
        // Handle VML picture elements
        let embedId: string | undefined;

        visit(element, (child) => {
          if (is(child, "element") && is(child, { name: "v:imagedata" })) {
            embedId = getAttribute(child, "r:id");
            return EXIT;
          }
          return CONTINUE;
        });

        const rel = embedId ? relationships[embedId] : undefined;
        nodeData.properties = { relationId: embedId, fileName: rel?.target };
      }

      // Handle comments and annotations
      if (tagName === "w:commentReference") {
        nodeData.ooxmlType = "commentReference";
        const commentRefProps: WmlCommentRefProperties = {
          id: getAttribute(element, "w:id") || "",
        };
        nodeData.properties = commentRefProps;
      }

      if (tagName === "w:commentRangeStart") {
        nodeData.ooxmlType = "commentRangeStart";
        nodeData.properties = {
          id: getAttribute(element, "w:id") || "",
        };
      }

      if (tagName === "w:commentRangeEnd") {
        nodeData.ooxmlType = "commentRangeEnd";
        nodeData.properties = {
          id: getAttribute(element, "w:id") || "",
        };
      }

      // Handle footnotes and endnotes
      if (tagName === "w:footnoteReference") {
        nodeData.ooxmlType = "footnoteReference";
        nodeData.properties = {
          id: getAttribute(element, "w:id") || "",
        };
      }

      if (tagName === "w:endnoteReference") {
        nodeData.ooxmlType = "endnoteReference";
        nodeData.properties = {
          id: getAttribute(element, "w:id") || "",
        };
      }

      // Handle field codes
      if (tagName === "w:fldSimple") {
        nodeData.ooxmlType = "simpleField";
        nodeData.properties = {
          instruction: getAttribute(element, "w:instr") || "",
        };
      }

      if (tagName === "w:fldChar") {
        nodeData.ooxmlType = "fieldChar";
        const charType = getAttribute(element, "w:fldCharType");
        nodeData.properties = {
          type:
            charType === "begin" ||
            charType === "separate" ||
            charType === "end"
              ? charType
              : "begin",
        };
      }

      if (tagName === "w:instrText") {
        nodeData.ooxmlType = "instructionText";
      }

      // Handle smart tags
      if (tagName === "w:smartTag") {
        nodeData.ooxmlType = "smartTag";
        const smartTagProps: WmlSmartTagProperties = {
          namespaceUri: getAttribute(element, "w:namespaceuri") || "",
          name: getAttribute(element, "w:name") || "",
        };
        nodeData.properties = smartTagProps;
      }

      // Handle headers and footers
      if (tagName === "w:hdr") {
        nodeData.ooxmlType = "header";
      }

      if (tagName === "w:ftr") {
        nodeData.ooxmlType = "footer";
      }

      // Handle property elements - remove them after processing
      if (tagName.endsWith("Pr")) {
        // Property elements are processed by their parent elements
        if (
          parentElement &&
          Array.isArray(parentElement.children) &&
          index !== undefined
        ) {
          parentElement.children.splice(index, 1);
          return index; // Adjust index
        }
      }

      // Handle unsupported/unnecessary elements
      if (
        [
          "mc:AlternateContent",
          "w:proofErr",
          "w:lastRenderedPageBreak",
          "w:noProof",
          "w:lang",
        ].includes(tagName)
      ) {
        // Remove unsupported elements
        if (
          parentElement &&
          Array.isArray(parentElement.children) &&
          index !== undefined
        ) {
          parentElement.children.splice(index, 1);
          return index;
        }
      }

      // Default case for unknown elements
      if (!nodeData.ooxmlType) {
        console.warn(`Unhandled element tag during enrichment: ${tagName}`);
        nodeData.ooxmlType = tagName; // Keep original tag name as fallback
      }
    } else if (is(node, "text")) {
      const textNode = node as OoxmlText;
      const shouldPreserve =
        parentElement?.attributes?.["xml:space"] === "preserve";

      // Remove empty text nodes unless preserving space
      if (textNode.value.trim() === "" && !shouldPreserve) {
        if (
          parentElement &&
          Array.isArray(parentElement.children) &&
          index !== undefined
        ) {
          parentElement.children.splice(index, 1);
          return index;
        }
      }

      nodeData.ooxmlType = "text";
      if (shouldPreserve) {
        nodeData.properties = { ...nodeData.properties, preserveSpace: true };
      }

      // Apply formatting from parent run and paragraph context
      if (
        parentElement &&
        (parentElement.data as OoxmlData | undefined)?.ooxmlType === "textRun"
      ) {
        const runData = parentElement.data as OoxmlData;
        const runProps = runData.properties as FontProperties | undefined;

        if (runProps && Object.keys(runProps).length > 0) {
          nodeData.properties = { ...nodeData.properties, ...runProps };
        }
      }
    } else if (is(node, ["comment", "instruction", "cdata", "doctype"])) {
      return CONTINUE;
    } else if (is(node, "root")) {
      return CONTINUE;
    } else {
      console.warn(`Discarding node of unhandled type: ${node.type}`);
      if (
        parentElement &&
        Array.isArray(parentElement.children) &&
        index !== undefined
      ) {
        parentElement.children.splice(index, 1);
        return index;
      }
    }

    return CONTINUE;
  });
}

// New function to parse section properties
function parseSectionProperties(
  sectPrElement: OoxmlElement,
): Record<string, unknown> {
  const sectProps: Record<string, unknown> = {};

  for (const child of sectPrElement.children || []) {
    if (!is(child, "element")) continue;

    switch (child.name) {
      case "w:pgSz":
        sectProps.pageSize = {
          width: parseMeasurement(getAttribute(child, "w:w"), "dxa"),
          height: parseMeasurement(getAttribute(child, "w:h"), "dxa"),
          orientation: getAttribute(child, "w:orient") || "portrait",
        };
        break;
      case "w:pgMar":
        sectProps.pageMargin = {
          top: parseMeasurement(getAttribute(child, "w:top"), "dxa"),
          right: parseMeasurement(getAttribute(child, "w:right"), "dxa"),
          bottom: parseMeasurement(getAttribute(child, "w:bottom"), "dxa"),
          left: parseMeasurement(getAttribute(child, "w:left"), "dxa"),
          header: parseMeasurement(getAttribute(child, "w:header"), "dxa"),
          footer: parseMeasurement(getAttribute(child, "w:footer"), "dxa"),
          gutter: parseMeasurement(getAttribute(child, "w:gutter"), "dxa"),
        };
        break;
      case "w:headerReference":
        if (!sectProps.headers) sectProps.headers = [];
        (sectProps.headers as Array<unknown>).push({
          type: getAttribute(child, "w:type") || "",
          relationId: getAttribute(child, "r:id") || "",
        });
        break;
      case "w:footerReference":
        if (!sectProps.footers) sectProps.footers = [];
        (sectProps.footers as Array<unknown>).push({
          type: getAttribute(child, "w:type") || "",
          relationId: getAttribute(child, "r:id") || "",
        });
        break;
      case "w:cols":
        sectProps.columns = {
          count: Number(getAttribute(child, "w:num")) || 1,
          space: parseMeasurement(getAttribute(child, "w:space"), "dxa"),
          equalWidth: parseOnOff(getAttribute(child, "w:equalWidth")) !== false,
        };
        break;
      case "w:type":
        sectProps.sectionType = getAttribute(child, "w:val") || "nextPage";
        break;
    }
  }

  return sectProps;
}

/**
 * Parse DOCX file content into OOXML AST
 * Follows unified.js naming convention (similar to fromXml, fromMarkdown)
 *
 * Based on the original docxToOoxmlAst implementation but adapted for unified.js patterns
 */
export const docxToOoxast: Plugin<[FromDocxOptions?], OoxmlRoot | undefined> = (
  options: FromDocxOptions = {},
) => {
  return async (
    _tree: OoxmlNode | undefined, // Input tree is ignored, we parse from VFile
    file: VFile,
  ): Promise<OoxmlRoot | undefined> => {
    if (options.debug) {
      console.log("docxToOoxast plugin: Starting DOCX parsing");
    }

    if (!file.value || !(file.value instanceof Uint8Array)) {
      file.message(
        new Error("VFile value must be a Uint8Array for OOXML parsing"),
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

    // --- Resource Parsing --- (Keep same structure as original)
    const resources = await parseStylesXml(decompressedFiles);
    await parseNumberingXml(decompressedFiles, resources);
    const relationships = await parseRelationshipsXml(decompressedFiles);
    const transformContext: TransformContext = { resources, relationships };

    if (options.handlers) {
      transformContext.customHandlers = options.handlers;
    }

    const comments = await parseCommentsXml(
      decompressedFiles,
      transformContext,
    );
    if (transformContext.resources) {
      transformContext.resources.comments = comments;
    }

    // --- Main Document Parsing --- (Keep same structure as original)
    const mainPartPath = "word/document.xml";
    if (!decompressedFiles[mainPartPath]) {
      file.message(
        new Error("Could not locate main document part (word/document.xml)"),
      );
      return undefined;
    }

    const mainXmlContent = strFromU8(decompressedFiles[mainPartPath]);
    let parsedXastRoot: OoxmlRoot;
    try {
      parsedXastRoot = fromXml(mainXmlContent) as OoxmlRoot;
      if (options.includeRawData) {
        file.data.rawXast = parsedXastRoot;
      }
    } catch (error: unknown) {
      console.error(`Error parsing XML with fromXml (${mainPartPath}):`, error);
      file.message(
        new Error(
          `XML parsing failed with fromXml for ${mainPartPath}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      return undefined;
    }

    // --- Find the w:body element ---
    const documentElement = parsedXastRoot.children?.find(
      (node): node is OoxmlElement => is(node, { name: "w:document" }),
    );
    const bodyElement = documentElement?.children?.find(
      (node): node is OoxmlElement => is(node, { name: "w:body" }),
    );

    if (!bodyElement) {
      file.message(
        new Error("Could not find <w:body> element in document.xml"),
      );
      return undefined;
    }
    // Ensure bodyElement has a children array
    if (!bodyElement.children) bodyElement.children = [];

    // --- Transformation using visit (same as original) ---
    try {
      transformXastToOoxmlAst(parsedXastRoot, transformContext);

      // --- List Grouping (same as original) ---
      groupListItems(bodyElement, transformContext);

      // --- Filter out Instructions from Body Children ---
      bodyElement.children = bodyElement.children.filter(
        (node) => !is(node, "instruction"),
      );

      // --- Create the Final Root with Body's Children ---
      const finalRoot: OoxmlRoot = {
        type: "root",
        children: bodyElement.children, // Assign processed body children
        data: {
          ooxmlType: "root",
          sharedResources: transformContext.resources,
        } as OoxmlRootData,
      };

      if (options.debug) {
        console.log("OOXML AST enrichment and list grouping completed");
      }
      return finalRoot;
    } catch (transformError: unknown) {
      console.error("Error during OOXML AST transformation:", transformError);
      file.message(
        new Error(
          `AST transformation failed: ${transformError instanceof Error ? transformError.message : String(transformError)}`,
        ),
      );
      return undefined;
    }
  };
};
