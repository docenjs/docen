import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { CSVGenerator } from "@docen/data";

async function main() {
  // Create CSV generator
  const generator = new CSVGenerator();

  // Sample document AST
  const document = {
    content: {
      type: "root" as const,
      children: [
        {
          type: "table" as const,
          children: [
            {
              type: "tableRow" as const,
              children: [
                {
                  type: "tableCell" as const,
                  children: [{ type: "text" as const, value: "Name" }],
                },
                {
                  type: "tableCell" as const,
                  children: [{ type: "text" as const, value: "Age" }],
                },
                {
                  type: "tableCell" as const,
                  children: [{ type: "text" as const, value: "Email" }],
                },
                {
                  type: "tableCell" as const,
                  children: [{ type: "text" as const, value: "City" }],
                },
              ],
            },
            {
              type: "tableRow" as const,
              children: [
                {
                  type: "tableCell" as const,
                  children: [{ type: "text" as const, value: "John Doe" }],
                },
                {
                  type: "tableCell" as const,
                  children: [{ type: "text" as const, value: "30" }],
                },
                {
                  type: "tableCell" as const,
                  children: [
                    { type: "text" as const, value: "john@example.com" },
                  ],
                },
                {
                  type: "tableCell" as const,
                  children: [{ type: "text" as const, value: "New York" }],
                },
              ],
            },
          ],
        },
      ],
    },
    metadata: {
      source: "example",
      timestamp: new Date().toISOString(),
    },
  };

  try {
    // Generate CSV content
    const result = await generator.generate(document, {
      delimiter: ",",
      quote: '"',
      escape: "\\",
      includeHeader: true,
    });

    // Write to file
    if (result.content instanceof Uint8Array) {
      writeFileSync(join(__dirname, "output.csv"), result.content);
    } else {
      writeFileSync(
        join(__dirname, "output.draft.csv"),
        new TextEncoder().encode(String(result.content)),
      );
    }
    console.log("Generated CSV file: output.csv");
  } catch (error) {
    console.error("Error generating CSV:", error);
  }
}

main();
