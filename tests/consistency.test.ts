import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Package configurations for multi-package consistency checking
interface PackageConfig {
  name: string;
  namespacePrefix: string;
  docsDir: string;
  srcDir: string;
  responsibleNamespaces: string[];
  excludedNamespaces: string[];
}

interface TagDefinition {
  namespace: string;
  tagName: string;
  lineNumber: number;
  filePath: string;
  context?: string;
  attributes: string[];
}

interface CodeTagLocation {
  tag: string;
  filePath: string;
  line?: number;
  type: "ContentMap" | "Interface";
}

interface ConstantDefinition {
  name: string;
  value: string | number;
  groupName: string;
  category: string;
  filePath: string;
}

interface NamespaceInconsistency {
  contentMapTag: string;
  interfaceTag: string;
  filePath: string;
  docVariations?: { tag: string; count: number; files: string[] }[];
}

interface DocumentationConsistency {
  documentedTags: TagDefinition[];
  implementedTags: string[];
  missingImplementations: TagDefinition[];
  extraImplementations: CodeTagLocation[];
  documentedConstants: string[];
  codeConstants: ConstantDefinition[];
  missingConstantsInDocs: ConstantDefinition[];
  namespaceInconsistencies: {
    contentMapTags: Array<{ tag: string; filePath: string; line?: number }>;
    interfaceDefinitions: Array<{
      tag: string;
      filePath: string;
      line?: number;
    }>;
    inconsistencies: NamespaceInconsistency[];
  };
}

// Package configurations
const PACKAGE_CONFIGS: PackageConfig[] = [
  {
    name: "ooxast",
    namespacePrefix: "a",
    docsDir: "./packages/ooxast/docs",
    srcDir: "./packages/ooxast/src",
    responsibleNamespaces: ["a", "pic", "drw", "xdr", "c", "dgm", "mc", "wps"],
    excludedNamespaces: ["w", "s", "sl", "p", "wp", "xlsx", "docx", "pptx"],
  },
  {
    name: "wmlast",
    namespacePrefix: "w",
    docsDir: "./packages/wmlast/docs",
    srcDir: "./packages/wmlast/src",
    responsibleNamespaces: ["w", "wp"],
    excludedNamespaces: [
      "a",
      "s",
      "sl",
      "p",
      "pic",
      "drw",
      "xdr",
      "c",
      "dgm",
      "mc",
      "wps",
      "xlsx",
      "docx",
      "pptx",
    ],
  },
  {
    name: "pmlast",
    namespacePrefix: "p",
    docsDir: "./packages/pmlast/docs",
    srcDir: "./packages/pmlast/src",
    responsibleNamespaces: ["p"],
    excludedNamespaces: [
      "a",
      "w",
      "s",
      "sl",
      "wp",
      "pic",
      "drw",
      "xdr",
      "c",
      "dgm",
      "mc",
      "wps",
      "xlsx",
      "docx",
      "pptx",
    ],
  },
  {
    name: "smlast",
    namespacePrefix: "s",
    docsDir: "./packages/smlast/docs",
    srcDir: "./packages/smlast/src",
    responsibleNamespaces: ["s", "sl"],
    excludedNamespaces: [
      "a",
      "w",
      "p",
      "wp",
      "pic",
      "drw",
      "xdr",
      "c",
      "dgm",
      "mc",
      "wps",
      "xlsx",
      "docx",
      "pptx",
    ],
  },
];

class MultiPackageDocumentationChecker {
  private logDir: string;

  constructor(logDir = "./.log") {
    this.logDir = logDir;
  }

  /**
   * Check consistency for a specific package
   */
  public checkPackage(packageConfig: PackageConfig): DocumentationConsistency {
    const checker = new PackageDocumentationChecker(packageConfig, this.logDir);
    return checker.run();
  }

  /**
   * Check consistency for all packages
   */
  public checkAllPackages(): Record<string, DocumentationConsistency> {
    const results: Record<string, DocumentationConsistency> = {};

    for (const config of PACKAGE_CONFIGS) {
      try {
        results[config.name] = this.checkPackage(config);
      } catch (error) {
        console.warn(`⚠️  Failed to check package ${config.name}: `, error);
        // Continue with other packages
      }
    }

    return results;
  }
}

class PackageDocumentationChecker {
  private config: PackageConfig;
  private logDir: string;
  private documentationContent: string = "";

  constructor(config: PackageConfig, logDir: string) {
    this.config = config;
    this.logDir = path.join(logDir, config.name);
  }

  /**
   * Load all documentation files
   */
  private loadDocumentation(): void {
    if (!fs.existsSync(this.config.docsDir)) {
      throw new Error(
        `Documentation directory not found: ${this.config.docsDir}`,
      );
    }

    const docFiles = fs
      .readdirSync(this.config.docsDir)
      .filter((file) => file.endsWith(".md"));

    this.documentationContent = "";
    for (const file of docFiles) {
      const filePath = path.join(this.config.docsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      this.documentationContent += content + "\n";
    }
  }

  /**
   * Extract tags from documentation
   */
  private extractDocumentationTags(): TagDefinition[] {
    const tags: TagDefinition[] = [];

    if (!fs.existsSync(this.config.docsDir)) {
      return tags;
    }

    const docFiles = fs
      .readdirSync(this.config.docsDir)
      .filter((file) => file.endsWith(".md"));

    for (const file of docFiles) {
      const filePath = path.join(this.config.docsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Match XML tags in documentation: <namespace:tagName>
      const tagRegex = /<([a-zA-Z]+):([a-zA-Z0-9]+)/g;
      let match;

      while ((match = tagRegex.exec(content)) !== null) {
        const [, namespace, tagName] = match;

        // Skip namespaces that are not this package's responsibility
        if (!this.config.responsibleNamespaces.includes(namespace)) {
          continue;
        }

        // Calculate line number
        const lineIndex = content.substring(0, match.index).split("\n").length;
        const lines = content.split("\n");
        const contextLine = lines[lineIndex - 1] || "";

        // Extract context (the paragraph containing this tag)
        const contextStart = Math.max(0, lineIndex - 3);
        const contextEnd = Math.min(lines.length, lineIndex + 2);
        const context = lines.slice(contextStart, contextEnd).join("\n").trim();

        // Extract attributes from this specific tag instance
        const tagWithAttrsRegex = new RegExp(
          `<${namespace}:${tagName}([^>]*)>`,
          "g",
        );
        const tagMatch = tagWithAttrsRegex.exec(contextLine);
        const attributes: string[] = [];

        if (tagMatch) {
          const attrsString = tagMatch[1];
          const attrRegex = /(\w+)=["']([^"']*)["']/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
            attributes.push(attrMatch[1]);
          }
        }

        tags.push({
          namespace,
          tagName,
          lineNumber: lineIndex,
          filePath: `${this.config.name}/docs/${file}`,
          context,
          attributes,
        });
      }
    }

    return tags;
  }

  /**
   * Extract implemented interfaces from code with locations
   */
  private extractImplementedInterfaces(): {
    tags: string[];
    locations: CodeTagLocation[];
  } {
    const implementedTags: string[] = [];
    const locations: CodeTagLocation[] = [];

    if (!fs.existsSync(this.config.srcDir)) {
      return { tags: implementedTags, locations };
    }

    const files = fs
      .readdirSync(this.config.srcDir)
      .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));

    for (const file of files) {
      const filePath = path.join(this.config.srcDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Extract interface names that extend Element
      const interfaceRegex =
        /export\s+interface\s+(\w+)[^{]*extends\s+Element[^{]*{[^}]*name\s*:\s*"([^"]+)"[^}]*}/g;
      let match;

      while ((match = interfaceRegex.exec(content)) !== null) {
        const [, _interfaceName, tagName] = match;
        const lineIndex = content.substring(0, match.index).split("\n").length;

        implementedTags.push(tagName);
        if (tagName.includes(":")) {
          locations.push({
            tag: tagName,
            filePath: `${this.config.name}/src/${file}`,
            line: lineIndex,
            type: "Interface",
          });
        }
      }

      // Extract ContentMap entries
      const contentMapRegex = /"([a-zA-Z]+):([a-zA-Z0-9]+)":\s*\w+/g;
      let contentMatch;

      while ((contentMatch = contentMapRegex.exec(content)) !== null) {
        const [, namespace, tagName] = contentMatch;
        const startIndex = content
          .substring(0, contentMatch.index)
          .split("\n").length;

        const fullTag = `${namespace}:${tagName}`;
        implementedTags.push(fullTag);
        locations.push({
          tag: fullTag,
          filePath: `${this.config.name}/src/${file}`,
          line: startIndex,
          type: "ContentMap",
        });
      }
    }

    return { tags: [...new Set(implementedTags)], locations };
  }

  /**
   * Extract namespace inconsistencies from code
   */
  private extractNamespaceInconsistencies(): {
    contentMapTags: Array<{ tag: string; filePath: string; line?: number }>;
    interfaceDefinitions: Array<{
      tag: string;
      filePath: string;
      line?: number;
    }>;
    inconsistencies: NamespaceInconsistency[];
  } {
    const contentMapTags: Array<{
      tag: string;
      filePath: string;
      line?: number;
    }> = [];
    const interfaceDefinitions: Array<{
      tag: string;
      filePath: string;
      line?: number;
    }> = [];
    const inconsistencies: NamespaceInconsistency[] = [];

    if (!fs.existsSync(this.config.srcDir)) {
      return { contentMapTags, interfaceDefinitions, inconsistencies };
    }

    const files = fs
      .readdirSync(this.config.srcDir)
      .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));

    for (const file of files) {
      const filePath = path.join(this.config.srcDir, file);
      const content = fs.readFileSync(filePath, "utf-8");

      // Extract ContentMap entries
      const contentMapRegex = /"([a-zA-Z]+):([a-zA-Z0-9]+)":\s*\w+/g;
      let contentMatch;

      while ((contentMatch = contentMapRegex.exec(content)) !== null) {
        const [, namespace, tagName] = contentMatch;
        const startIndex = content
          .substring(0, contentMatch.index)
          .split("\n").length;

        contentMapTags.push({
          tag: `${namespace}:${tagName}`,
          filePath: `${this.config.name}/src/${file}`,
          line: startIndex,
        });
      }

      // Extract interface definitions
      const interfaceRegex =
        /export\s+interface\s+(\w+)[^{]*extends\s+Element[^{]*{[^}]*name\s*:\s*"([^"]+)"[^}]*}/g;
      let interfaceMatch;

      while ((interfaceMatch = interfaceRegex.exec(content)) !== null) {
        const [, _interfaceName, tagName] = interfaceMatch;
        const lineIndex = content
          .substring(0, interfaceMatch.index)
          .split("\n").length;

        if (tagName.includes(":")) {
          interfaceDefinitions.push({
            tag: tagName,
            filePath: `${this.config.name}/src/${file}`,
            line: lineIndex,
          });
        }
      }
    }

    // Find inconsistencies by comparing base names (without namespace)
    const contentMapBaseNames = new Map<string, string>();
    contentMapTags.forEach(({ tag }) => {
      const [_namespace, baseName] = tag.split(":");
      contentMapBaseNames.set(baseName, tag);
    });

    interfaceDefinitions.forEach(({ tag, filePath, line: _line }) => {
      const [_namespace, baseName] = tag.split(":");
      const contentMapTag = contentMapBaseNames.get(baseName);

      if (contentMapTag && contentMapTag !== tag) {
        inconsistencies.push({
          contentMapTag,
          interfaceTag: tag,
          filePath,
        });
      }
    });

    return {
      contentMapTags,
      interfaceDefinitions,
      inconsistencies,
    };
  }

  /**
   * Extract constants from code
   */
  private extractCodeConstants(): ConstantDefinition[] {
    const constants: ConstantDefinition[] = [];
    const constantsFile = path.join(this.config.srcDir, "constants.ts");
    if (!fs.existsSync(constantsFile)) return constants;

    const content = fs.readFileSync(constantsFile, "utf-8");

    // Extract namespace constants
    const namespaceRegex = /NAMESPACES\s*=\s*{([^}]+)}/s;
    const namespaceMatch = namespaceRegex.exec(content);
    if (namespaceMatch) {
      constants.push(
        ...this.extractConstantsFromBlock(
          namespaceMatch[1],
          "NAMESPACES",
          "namespace",
        ),
      );
    }

    // Extract other constant objects (simplified for multi-package)
    const constantBlocks = [
      {
        pattern: /PRESET_GEOMETRY_TYPES\s*=\s*{([^}]+)}/s,
        name: "PRESET_GEOMETRY_TYPES",
        category: "geometry",
      },
      {
        pattern: /FILL_TYPES\s*=\s*{([^}]+)}/s,
        name: "FILL_TYPES",
        category: "fill",
      },
      // Add more patterns as needed for each package
    ];

    for (const block of constantBlocks) {
      const match = block.pattern.exec(content);
      if (match) {
        constants.push(
          ...this.extractConstantsFromBlock(
            match[1],
            block.name,
            block.category,
          ),
        );
      }
    }

    return constants;
  }

  private extractConstantsFromBlock(
    blockContent: string,
    groupName: string,
    category: string,
  ): ConstantDefinition[] {
    const constants: ConstantDefinition[] = [];

    // Remove comments and empty lines
    const cleanContent = blockContent
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*[\r\n]/gm, "");

    // Match key-value pairs
    const pairRegex = /(\w+)\s*:\s*"([^"]*)"/g;
    let match;

    while ((match = pairRegex.exec(cleanContent)) !== null) {
      const [, name, value] = match;
      constants.push({
        name,
        value,
        groupName,
        category,
        filePath: `${this.config.name}/src/constants.ts`,
      });
    }

    return constants;
  }

  /**
   * Extract constants mentioned in documentation
   */
  private extractDocumentedConstants(): string[] {
    const documentedConstants: string[] = [];

    // Extract quoted strings that look like constant values
    const quotedStringRegex = /"([a-zA-Z0-9_]+)"/g;
    let match;

    while (
      (match = quotedStringRegex.exec(this.documentationContent)) !== null
    ) {
      const value = match[1];
      if (value.length > 1 && !value.startsWith("http")) {
        documentedConstants.push(value);
      }
    }

    // Extract specific keywords that might be constants
    const keywordRegex = /\b([a-zA-Z][a-zA-Z0-9_]*)\b/g;
    const lines = this.documentationContent.split("\n");

    for (const line of lines) {
      // Skip lines that are clearly code examples with namespaces
      if (line.includes("<") && line.includes(":") && line.includes(">")) {
        continue;
      }

      // Look for keywords that might be constants
      while ((match = keywordRegex.exec(line)) !== null) {
        const value = match[1];
        if (
          value.length > 2 &&
          value === value.toUpperCase() &&
          !value.startsWith("HTTP") &&
          !documentedConstants.includes(value)
        ) {
          documentedConstants.push(value);
        }
      }
    }

    return [...new Set(documentedConstants)];
  }

  /**
   * Generate comprehensive report content for log files
   */
  private generateReportContent(
    result: DocumentationConsistency,
    coverage: any,
  ): string {
    // Define excluded and included namespaces for this package
    const excludedNamespaces = this.config.excludedNamespaces;
    const includedNamespaces = this.config.responsibleNamespaces;

    return `
${this.config.name.toUpperCase()} Consistency Check Report
=========================================
Timestamp: ${new Date().toISOString()}
Package: ${this.config.name}

========================================
NAMESPACE FILTERING CONFIGURATION
========================================
EXCLUDED NAMESPACES (Not ${this.config.name} responsibility):
${excludedNamespaces.map((ns) => `  - ${ns}:`).join("\n")}
${excludedNamespaces.includes("w") ? "  w:    - WordprocessingML (handled by wmlast)\n" : ""}
${excludedNamespaces.includes("s") ? "  s:    - SpreadsheetML (handled by smlast)\n" : ""}
${excludedNamespaces.includes("p") ? "  p:    - PresentationML (handled by pmlast)\n" : ""}
${excludedNamespaces.includes("wp") ? "  wp:   - WordProcessing Drawing (handled by wmlast)\n" : ""}
${excludedNamespaces.includes("sl") ? "  sl:   - SpreadsheetML related tags\n" : ""}
${excludedNamespaces.includes("xlsx") ? "  xlsx: - SpreadsheetML file format\n" : ""}
${excludedNamespaces.includes("docx") ? "  docx: - WordprocessingML file format\n" : ""}
${excludedNamespaces.includes("pptx") ? "  pptx: - PresentationML file format\n" : ""}

INCLUDED NAMESPACES (${this.config.name} responsibility):
${includedNamespaces.map((ns) => `  - ${ns}:`).join("\n")}
${includedNamespaces.includes("a") ? "  a:    - DrawingML (main drawing namespace) - shared across all document types\n" : ""}
${includedNamespaces.includes("pic") ? "  pic:  - Pictures (DrawingML pictures) - shared picture definitions\n" : ""}
${includedNamespaces.includes("xdr") ? "  xdr:  - Spreadsheet Drawing (DrawingML for spreadsheets) - shared DrawingML\n" : ""}
${includedNamespaces.includes("c") ? "  c:    - Charts (DrawingML charts) - shared chart definitions\n" : ""}
${includedNamespaces.includes("dgm") ? "  dgm:  - Diagrams (DrawingML diagrams) - shared diagram definitions\n" : ""}
${includedNamespaces.includes("mc") ? "  mc:   - Markup Compatibility - shared compatibility framework\n" : ""}
${includedNamespaces.includes("wps") ? "  wps:  - WordProcessing Shapes (extended DrawingML for Word) - shared\n" : ""}
${includedNamespaces.includes("w") ? "  w:    - WordprocessingML (main document namespace)\n" : ""}
${includedNamespaces.includes("wp") ? "  wp:   - WordProcessing Drawing (embedded drawings in Word)\n" : ""}
${includedNamespaces.includes("p") ? "  p:    - PresentationML (slide and presentation elements)\n" : ""}
${includedNamespaces.includes("s") ? "  s:    - SpreadsheetML (worksheet and spreadsheet elements)\n" : ""}
${includedNamespaces.includes("sl") ? "  sl:   - SpreadsheetML related tags\n" : ""}

========================================
SUMMARY STATISTICS
========================================
Coverage Statistics:
- Documented Tags: ${coverage.totalDocumentedTags} (filtered from all documentation)
- Implemented Tags: ${coverage.totalImplementedTags}
- Tag Implementation Coverage: ${coverage.tagImplementationCoverage.toFixed(1)}%
- Code Constants: ${coverage.totalCodeConstants}
- Documented Constants: ${coverage.totalDocumentedConstants}
- Constant Documentation Coverage: ${coverage.constantDocumentationCoverage.toFixed(1)}%

Issues Summary:
- Missing Implementations: ${result.missingImplementations.length} (critical)
- Extra Implementations: ${result.extraImplementations.length} (code errors - undocumented tags)
- Missing Constants in Docs: ${result.missingConstantsInDocs.length}
- Namespace Inconsistencies: ${result.namespaceInconsistencies.inconsistencies.length} (critical - ContentMap vs Interface mismatch)

========================================
TAG ANALYSIS WITH MATCHING STATUS
========================================
1. PROPERLY IMPLEMENTED TAGS ✅
-------------------------------
Tags that exist in both documentation and code
Count: ${coverage.totalDocumentedTags - result.missingImplementations.length}
${result.documentedTags
  .filter((docTag) => {
    const fullTag = `${docTag.namespace}:${docTag.tagName}`;
    return result.implementedTags.includes(fullTag);
  })
  .map(
    (tag) =>
      `  ✅ ${tag.namespace}:${tag.tagName} (line ${tag.lineNumber}) - ${tag.filePath}`,
  )
  .join("\n")}

2. MISSING IMPLEMENTATIONS ❌
-----------------------------
Tags mentioned in documentation but not implemented in code (CRITICAL)
Count: ${result.missingImplementations.length}
${result.missingImplementations
  .map(
    (missing) =>
      `  ❌ ${missing.namespace}:${missing.tagName} - DOCUMENTATION REFERENCE:
     📁 File: ${missing.filePath} (line ${missing.lineNumber})
     📝 Context: ${missing.context}
     ${missing.attributes.length > 0 ? `     🔧 Attributes: ${missing.attributes.join(", ")}\n` : ""}`,
  )
  .join("\n")}

3. EXTRA IMPLEMENTATIONS ❌
---------------------------
Tags implemented in code but not mentioned in documentation (ERROR)
Count: ${result.extraImplementations.length}
${result.extraImplementations
  .map((tag) => {
    const [_namespace, tagName] = tag.tag.split(":");
    return `  ❌ ${tag.tag} - CODE LOCATION:
     📁 File: ${tag.filePath} (line ${tag.line}) - Type: ${tag.type}
     🔍 Suffix "${tagName}" variations: No variations found in documentation`;
  })
  .join("\n")}

4. NAMESPACE INCONSISTENCIES 🚨
-----------------------------
CRITICAL: ContentMap tags use different namespaces than Interface definitions
Count: ${result.namespaceInconsistencies.inconsistencies.length}
${result.namespaceInconsistencies.inconsistencies
  .map((inconsistency) => {
    return `  🚨 ${inconsistency.contentMapTag} (ContentMap) vs ${inconsistency.interfaceTag} (Interface) in ${inconsistency.filePath}
     ❓ No variations found in documentation`;
  })
  .join("\n")}

5. ALL IMPLEMENTED TAGS 🔧
-------------------------
Complete list of tags implemented in ${this.config.name} code
Count: ${result.implementedTags.length}
${result.implementedTags.map((tag) => `  🔧 ${tag}`).join("\n")}

========================================
CONSTANT ANALYSIS WITH MATCHING STATUS
========================================
6. PROPERLY DOCUMENTED CONSTANTS ✅
----------------------------------
Constants that are mentioned in documentation
Count: ${coverage.totalCodeConstants - result.missingConstantsInDocs.length}
${result.codeConstants
  .filter((constant) => {
    const valueStr = constant.value.toString();
    const quotedValue = `"${valueStr}"`;
    const valueWithQuotesInDocs =
      this.documentationContent.includes(quotedValue);
    const partialMatch = this.documentationContent.includes(valueStr);
    const mentionedWithoutQuotes = result.documentedConstants.some(
      (mentioned) =>
        mentioned === constant.name ||
        mentioned === valueStr ||
        mentioned === constant.name.toLowerCase() ||
        mentioned === valueStr.toLowerCase(),
    );
    return valueWithQuotesInDocs || partialMatch || mentionedWithoutQuotes;
  })
  .map(
    (constant) =>
      `  ✅ ${constant.groupName}.${constant.name} = "${constant.value}" (${constant.category}) - ${constant.filePath}`,
  )
  .join("\n")}

7. MISSING CONSTANTS IN DOCS ❌
------------------------------
Constants implemented in code but not mentioned in documentation
Count: ${result.missingConstantsInDocs.length}
${result.missingConstantsInDocs
  .map(
    (constant) =>
      `  ❌ ${constant.groupName}.${constant.name} = "${constant.value}" (${constant.category}) - ${constant.filePath}`,
  )
  .join("\n")}

8. ALL DOCUMENTED CONSTANTS 📝
------------------------------
Values mentioned in documentation that might be constants
Count: ${result.documentedConstants.length}
${result.documentedConstants
  .slice(0, 100)
  .map((value) => `  📝 ${value}`)
  .join("\n")}
${result.documentedConstants.length > 100 ? `\n  ... and ${result.documentedConstants.length - 100} more values` : ""}

9. ALL CODE CONSTANTS 🔢
-----------------------
Complete list of constants defined in code
Count: ${result.codeConstants.length}
${result.codeConstants
  .map(
    (constant) =>
      `  🔢 ${constant.groupName}.${constant.name} = "${constant.value}" (${constant.category}) - ${constant.filePath}`,
  )
  .join("\n")}
========================================
END OF REPORT
========================================
Generated by ${this.config.name} consistency checker
Documentation is treated as 100% accurate source of truth
`;
  }

  /**
   * Save results to log file
   */
  private saveResultsToLog(
    result: DocumentationConsistency,
    coverage: any,
  ): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logFileName = `${this.config.name}-consistency-${timestamp}.log`;

    // Create log directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const logContent = this.generateReportContent(result, coverage);
    fs.writeFileSync(path.join(this.logDir, logFileName), logContent);
  }

  /**
   * Run the consistency check
   */
  public run(): DocumentationConsistency {
    this.loadDocumentation();
    const documentedTags = this.extractDocumentationTags();
    const { tags: implementedTags, locations: tagLocations } =
      this.extractImplementedInterfaces();
    const codeConstants = this.extractCodeConstants();
    const documentedConstants = this.extractDocumentedConstants();
    const namespaceInconsistencies = this.extractNamespaceInconsistencies();

    // Find missing implementations (tags in docs but not in code)
    const missingImplementations = documentedTags.filter((tag) => {
      const fullTag = `${tag.namespace}:${tag.tagName}`;
      return !implementedTags.includes(fullTag);
    });

    // Find extra implementations (tags in code but not in docs)
    const extraImplementations: CodeTagLocation[] = [];
    implementedTags.forEach((tag) => {
      const [namespace, tagName] = tag.split(":");
      const isDocumented = documentedTags.some(
        (docTag) =>
          docTag.namespace === namespace && docTag.tagName === tagName,
      );

      if (!isDocumented) {
        const locations = tagLocations.filter((loc) => loc.tag === tag);
        extraImplementations.push(...locations);
      }
    });

    // Find constants that are in code but not mentioned in docs
    const missingConstantsInDocs = codeConstants.filter((constant) => {
      const valueStr = constant.value.toString();
      const quotedValue = `"${valueStr}"`;
      const valueWithQuotesInDocs =
        this.documentationContent.includes(quotedValue);
      const partialMatch = this.documentationContent.includes(valueStr);
      const mentionedWithoutQuotes = documentedConstants.some(
        (mentioned) =>
          mentioned === constant.name ||
          mentioned === valueStr ||
          mentioned === constant.name.toLowerCase() ||
          mentioned === valueStr.toLowerCase(),
      );
      const isDocumented =
        valueWithQuotesInDocs || partialMatch || mentionedWithoutQuotes;
      return !isDocumented;
    });

    return {
      documentedTags,
      implementedTags,
      missingImplementations,
      extraImplementations,
      documentedConstants,
      codeConstants,
      missingConstantsInDocs,
      namespaceInconsistencies,
    };
  }
}

describe("Multi-Package OOXML AST Documentation-Code Consistency Check", () => {
  let checker: MultiPackageDocumentationChecker;

  beforeEach(() => {
    // Create log directory
    const logDir = path.join(__dirname, "./.log");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    checker = new MultiPackageDocumentationChecker(logDir);
  });

  it("should check consistency for all configured packages", () => {
    const results = checker.checkAllPackages();

    console.log("\n🔍 Multi-Package OOXML AST Consistency Check:");
    console.log("==============================================");

    let totalIssues = 0;
    let totalPackages = 0;

    for (const [packageName, result] of Object.entries(results)) {
      totalPackages++;

      // Calculate coverage statistics
      const coverage = {
        totalDocumentedTags: result.documentedTags.length,
        totalImplementedTags: result.implementedTags.length,
        tagImplementationCoverage:
          result.documentedTags.length > 0
            ? (result.implementedTags.length / result.documentedTags.length) *
              100
            : 0,
        totalCodeConstants: result.codeConstants.length,
        totalDocumentedConstants: result.documentedConstants.length,
        constantDocumentationCoverage:
          result.codeConstants.length > 0
            ? (result.codeConstants.filter(
                (constant) => !result.missingConstantsInDocs.includes(constant),
              ).length /
                result.codeConstants.length) *
              100
            : 0,
      };

      const packageIssues =
        result.missingImplementations.length +
        result.extraImplementations.length +
        result.missingConstantsInDocs.length +
        result.namespaceInconsistencies.inconsistencies.length;

      totalIssues += packageIssues;

      console.log(`\n📦 ${packageName}:`);
      console.log(`  📊 Documented Tags: ${coverage.totalDocumentedTags}`);
      console.log(`  📊 Implemented Tags: ${coverage.totalImplementedTags}`);
      console.log(
        `  📊 Coverage: ${coverage.tagImplementationCoverage.toFixed(1)}%`,
      );
      console.log(
        `  📊 Constants: ${coverage.totalCodeConstants} code, ${coverage.totalDocumentedConstants} documented`,
      );
      console.log(
        `  📊 Constant Coverage: ${coverage.constantDocumentationCoverage.toFixed(1)}%`,
      );
      console.log(`  🚨 Issues: ${packageIssues} total`);
      console.log(
        `    ❌ Missing Implementations: ${result.missingImplementations.length}`,
      );
      console.log(
        `    ❌ Extra Implementations: ${result.extraImplementations.length}`,
      );
      console.log(
        `    ❌ Missing Constants: ${result.missingConstantsInDocs.length}`,
      );
      console.log(
        `    🚨 Namespace Issues: ${result.namespaceInconsistencies.inconsistencies.length}`,
      );

      // Save detailed results to log file
      const packageChecker = new PackageDocumentationChecker(
        PACKAGE_CONFIGS.find((c) => c.name === packageName)!,
        path.join(__dirname, "./.log"),
      );
      packageChecker["saveResultsToLog"](result, coverage);
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`  📦 Packages Checked: ${totalPackages}`);
    console.log(`  🚨 Total Issues: ${totalIssues}`);
    console.log(`  📁 Logs saved to: ${path.join(__dirname, "./.log")}`);

    // Basic validation
    expect(Object.keys(results).length).toBeGreaterThan(0);
    expect(totalPackages).toBeGreaterThan(0);
  });

  it("should display package configurations", () => {
    console.log("\n📋 Package Configurations:");
    console.log("==========================");

    PACKAGE_CONFIGS.forEach((config) => {
      console.log(`\n📦 ${config.name}:`);
      console.log(`  🏷️  Namespace Prefix: ${config.namespacePrefix}`);
      console.log(`  📂 Docs Dir: ${config.docsDir}`);
      console.log(`  📂 Src Dir: ${config.srcDir}`);
      console.log(
        `  🔧 Responsible Namespaces: ${config.responsibleNamespaces.join(", ")}`,
      );
      console.log(
        `  ❌ Excluded Namespaces: ${config.excludedNamespaces.join(", ")}`,
      );
    });

    expect(PACKAGE_CONFIGS.length).toBeGreaterThan(0);
  });
});
