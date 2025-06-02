/**
 * DOCX Template building blocks and configuration utilities
 * Functional approach for composable DOCX templates
 */

import { defu } from "defu";
import type { DocxStyleDefinition, DocxTemplateConfig } from "./types";

// --- DOCX Template Building Blocks ---

/**
 * Create basic page layout configuration
 */
export function createPageLayout(
  options: {
    size?: "A4" | "Letter" | "Legal" | { width: number; height: number };
    orientation?: "portrait" | "landscape";
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  } = {},
): Pick<DocxTemplateConfig, "pageSettings"> {
  const { size = "A4", orientation = "portrait", margins } = options;

  let width: number;
  let height: number;

  switch (size) {
    case "A4":
      width = 595.28;
      height = 841.89;
      break;
    case "Letter":
      width = 612;
      height = 792;
      break;
    case "Legal":
      width = 612;
      height = 1008;
      break;
    default:
      width = size.width;
      height = size.height;
  }

  // Swap dimensions for landscape
  if (orientation === "landscape") {
    [width, height] = [height, width];
  }

  return {
    pageSettings: {
      width,
      height,
      orientation,
      margin: {
        top: 72, // 1 inch default
        right: 72,
        bottom: 72,
        left: 72,
        ...margins,
      },
    },
  };
}

/**
 * Create typography configuration
 */
export function createTypography(
  options: {
    bodyFont?: string;
    headingFont?: string;
    fontSize?: number;
    lineHeight?: number;
  } = {},
): Pick<DocxTemplateConfig, "styles"> {
  const {
    bodyFont = "Calibri",
    headingFont = bodyFont,
    fontSize = 11,
    lineHeight = 1.15,
  } = options;

  const paragraphStyles: DocxStyleDefinition[] = [
    {
      id: "Normal",
      name: "Normal",
      type: "paragraph",
      run: {
        font: bodyFont,
        size: fontSize,
      },
      paragraph: {
        spacing: {
          line: Math.round(fontSize * lineHeight * 20), // Convert to twentieths of a point
          after: 0,
        },
      },
    },
    {
      id: "Heading1",
      name: "Heading 1",
      type: "paragraph",
      basedOn: "Normal",
      next: "Normal",
      run: {
        font: headingFont,
        size: Math.round(fontSize * 1.6),
        bold: true,
        color: "2E74B5",
      },
      paragraph: {
        spacing: {
          before: Math.round(fontSize * 0.5 * 20),
          after: Math.round(fontSize * 0.25 * 20),
        },
      },
    },
    {
      id: "Heading2",
      name: "Heading 2",
      type: "paragraph",
      basedOn: "Normal",
      next: "Normal",
      run: {
        font: headingFont,
        size: Math.round(fontSize * 1.3),
        bold: true,
        color: "2E74B5",
      },
      paragraph: {
        spacing: {
          before: Math.round(fontSize * 0.4 * 20),
          after: Math.round(fontSize * 0.2 * 20),
        },
      },
    },
  ];

  return {
    styles: {
      paragraphStyles,
    },
  };
}

/**
 * Create document metadata configuration
 */
export function createMetadata(
  options: {
    title?: string;
    description?: string;
    creator?: string;
    subject?: string;
    keywords?: string[];
    category?: string;
  } = {},
): Pick<DocxTemplateConfig, "metadata"> {
  const {
    title = "Document",
    description,
    creator = "Docen DOCX Template System",
    subject,
    keywords = [],
    category,
  } = options;

  return {
    metadata: {
      title,
      description,
      creator,
      subject,
      keywords: keywords.join(", "),
      category,
      created: new Date(),
      modified: new Date(),
    },
  };
}

/**
 * Create table of contents configuration
 */
export function createTableOfContents(
  options: {
    title?: string;
    styles?: string[];
    levels?: number;
    pageNumbers?: boolean;
    hyperlinks?: boolean;
  } = {},
): Pick<DocxTemplateConfig, "tableOfContents"> {
  const {
    title = "Table of Contents",
    styles = ["Heading1", "Heading2", "Heading3"],
    levels = 3,
    pageNumbers = true,
    hyperlinks = true,
  } = options;

  return {
    tableOfContents: {
      title,
      styles,
      levels,
      pageNumbers,
      hyperlinks,
    },
  };
}

/**
 * Create numbering configuration for lists
 */
export function createNumbering(
  options: {
    id?: string;
    type?: "bullet" | "decimal" | "outline";
    levels?: number;
  } = {},
): Pick<DocxTemplateConfig, "numbering"> {
  const { id = "default", type = "bullet", levels = 3 } = options;

  const numberingLevels = Array.from({ length: levels }, (_, index) => ({
    level: index,
    format:
      type === "bullet"
        ? ("bullet" as const)
        : type === "decimal"
          ? ("decimal" as const)
          : ("decimal" as const),
    text: type === "bullet" ? "•" : `%${index + 1}.`,
    start: 1,
    indent: {
      left: (index + 1) * 360, // 0.25 inch per level
      hanging: 180, // 0.125 inch
    },
  }));

  return {
    numbering: [
      {
        id,
        levels: numberingLevels,
      },
    ],
  };
}

// --- Configuration Composition Utilities ---

/**
 * Merge multiple DOCX template configurations using defu deep merging
 * Leverages c12/defu for proper nested object merging
 */
export function composeDocxTemplate(
  ...configs: Array<Partial<DocxTemplateConfig>>
): DocxTemplateConfig {
  // Use defu for deep merging - it handles arrays and nested objects properly
  // Note: defu merges from right to left, so we reverse the order
  return defu({}, ...configs.reverse()) as DocxTemplateConfig;
}
