import { fromXml } from "xast-util-from-xml";
import { unzip, Unzipped } from "fflate";
import { Package, Root, RootData, Relationship } from "@docen/wmlast";

export interface FromDocxOptions {
  // Core document content
  document?: boolean; // word/document.xml (默认: true)

  // Style and formatting
  styles?: boolean; // word/styles.xml
  numbering?: boolean; // word/numbering.xml
  theme?: boolean; // word/theme/*.xml
  fontTable?: boolean; // word/fontTable.xml

  // Document components
  comments?: boolean; // word/comments.xml
  footnotes?: boolean; // word/footnotes.xml
  endnotes?: boolean; // word/endnotes.xml

  // Settings and configuration
  settings?: boolean; // word/settings.xml
  webSettings?: boolean; // word/webSettings.xml

  // Document properties
  coreProperties?: boolean; // docProps/core.xml
  appProperties?: boolean; // docProps/app.xml
  customProperties?: boolean; // docProps/custom.xml

  // Headers and footers
  headers?: boolean; // word/header*.xml
  footers?: boolean; // word/footer*.xml

  // Package metadata
  contentTypes?: boolean; // [Content_Types].xml

  // Glossary (术语表)
  glossary?: boolean; // word/glossary/*.xml
}

// Type guards
export function isRoot(node: any): node is Root {
  return (
    node &&
    typeof node === "object" &&
    "data" in node &&
    typeof node.data === "object" &&
    "fileType" in node.data
  );
}

export function isPackage(node: any): node is Package {
  return (
    node &&
    typeof node === "object" &&
    node.type === "package" &&
    "children" in node &&
    Array.isArray(node.children) &&
    "data" in node
  );
}

/**
 * Parse a DOCX file and extract its XML content as wmlast Package
 */
export async function parseDocx(
  docx: Buffer | Uint8Array,
  options: FromDocxOptions = {},
): Promise<Package> {
  // 1. Unzip the DOCX file
  const files = await new Promise<Unzipped>((resolve, reject) => {
    unzip(docx, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  // Initialize the result package
  const result: Package = {
    type: "package",
    children: [],
    data: {
      relationships: new Map(),
      parts: new Map(),
      media: new Map(),
    },
  };

  // 2. Parse all XML files and create Root nodes
  const roots: Root[] = [];

  for (const [path, content] of Object.entries(files)) {
    try {
      if (path.endsWith(".xml") || path.endsWith(".rels")) {
        // Parse XML and .rels files as xast
        const xmlContent = new TextDecoder().decode(content);
        const xastRoot = fromXml(xmlContent);

        // Create Root node with metadata
        const root: Root = {
          ...xastRoot,
          data: {
            ...xastRoot.data,
            filePath: path,
            fileType: getFileType(path),
          } as RootData,
        };

        roots.push(root);
        if (root.data) {
          result.data.parts.set(path, root);
        }

        // Store binary files for non-XML content
        if (!path.endsWith(".xml") && !path.endsWith(".rels")) {
          result.data.media.set(path, content);
        }
      } else {
        // Store non-XML files
        result.data.media.set(path, content);
      }
    } catch (error) {
      console.warn(`Failed to process file ${path}:`, error);
    }
  }

  // 3. Filter and add roots based on options
  result.children = roots.filter((root): root is Root => {
    const fileType = root.data?.fileType;

    // Always include document
    if (fileType === "document") return true;

    // Include based on options
    if (fileType === "styles" && options.styles) return true;
    if (fileType === "comments" && options.comments) return true;
    if (fileType === "footnotes" && options.footnotes) return true;
    if (fileType === "numbering" && options.numbering) return true;
    if (fileType === "endnotes" && options.endnotes) return true;
    if (fileType === "header" && options.headers) return true;
    if (fileType === "footer" && options.footers) return true;
    if (fileType === "theme" && options.theme) return true;
    if (fileType === "fontTable" && options.fontTable) return true;
    if (fileType === "settings" && options.settings) return true;
    if (fileType === "webSettings" && options.webSettings) return true;
    if (fileType === "coreProperties" && options.coreProperties) return true;
    if (fileType === "appProperties" && options.appProperties) return true;
    if (fileType === "customProperties" && options.customProperties)
      return true;
    if (fileType === "contentTypes" && options.contentTypes) return true;
    if (fileType === "glossary" && options.glossary) return true;

    return false;
  });

  // 4. Parse package-level relationships
  parsePackageRelationships(files, result.data.relationships);

  return result;
}

/**
 * Quick parse - only get the main document root
 */
export async function fromDocx(
  docx: Buffer | Uint8Array,
  options?: FromDocxOptions,
): Promise<Root> {
  const parsed = await parseDocx(docx, options);
  const documentRoot = parsed.children.find(
    (root): root is Root => isRoot(root) && root.data?.fileType === "document",
  );
  if (!documentRoot) {
    throw new Error("No document root found");
  }
  return documentRoot;
}

// Helper functions
function getFileType(path: string): RootData["fileType"] {
  // Core document
  if (path === "word/document.xml") return "document";

  // Style and formatting
  if (path === "word/styles.xml") return "styles";
  if (path === "word/numbering.xml") return "numbering";
  if (path.startsWith("word/theme/")) return "theme";
  if (path === "word/fontTable.xml") return "fontTable";

  // Document components
  if (path === "word/comments.xml") return "comments";
  if (path === "word/footnotes.xml") return "footnotes";
  if (path === "word/endnotes.xml") return "endnotes";

  // Settings and configuration
  if (path === "word/settings.xml") return "settings";
  if (path === "word/webSettings.xml") return "webSettings";

  // Document properties
  if (path === "docProps/core.xml") return "coreProperties";
  if (path === "docProps/app.xml") return "appProperties";
  if (path === "docProps/custom.xml") return "customProperties";

  // Headers and footers
  if (path.startsWith("word/header/")) return "header";
  if (path.startsWith("word/footer/")) return "footer";

  // Package metadata
  if (path === "[Content_Types].xml") return "contentTypes";

  // Glossary (术语表)
  if (path.startsWith("word/glossary/")) return "glossary";

  return undefined;
}

function parseRelationships(xastRoot: any): Relationship[] {
  const relationships: Relationship[] = [];

  // Look for Relationship elements in .rels files
  if (xastRoot.type === "root" && xastRoot.children) {
    xastRoot.children.forEach((child: any) => {
      if (child.type === "element" && child.name === "Relationships") {
        child.children?.forEach((rel: any) => {
          if (rel.type === "element" && rel.name === "Relationship") {
            const targetMode = rel.attributes?.TargetMode;
            relationships.push({
              id: rel.attributes?.Id || "",
              type: rel.attributes?.Type || "",
              target: rel.attributes?.Target || "",
              targetMode:
                targetMode === "Internal" || targetMode === "External"
                  ? targetMode
                  : undefined,
            });
          }
        });
      }
    });
  }

  return relationships;
}

function parsePackageRelationships(
  files: Unzipped,
  relationships: Map<string, Relationship[]>,
) {
  // Parse .rels files
  Object.entries(files).forEach(([path, content]) => {
    if (path.endsWith(".rels")) {
      try {
        const xmlContent = new TextDecoder().decode(content);
        const xastRoot = fromXml(xmlContent);
        const rels = parseRelationships(xastRoot);
        if (rels.length > 0) {
          relationships.set(path, rels);
        }
      } catch (error) {
        console.warn(`Failed to parse relationships from ${path}:`, error);
      }
    }
  });
}
