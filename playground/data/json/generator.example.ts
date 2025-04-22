import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { JSONGenerator } from "@docen/data";

async function main() {
  // Create JSON generator
  const generator = new JSONGenerator();

  // Create a sample document AST
  const document = {
    type: "document" as const,
    content: {
      type: "root" as const,
      children: [
        {
          type: "table" as const,
          header: true,
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
              ],
            },
          ],
        },
      ],
    },
    metadata: {
      title: "Sample Document",
      author: "John Doe",
      date: new Date().toISOString(),
    },
  };

  try {
    // Generate JSON content
    const result = await generator.generate(document, {
      pretty: true,
      handleSpecialValues: true,
    });

    // Write to file
    if (result.content instanceof Uint8Array) {
      writeFileSync(join(__dirname, "output.draft.json"), result.content);
    } else {
      writeFileSync(
        join(__dirname, "output.draft.json"),
        String(result.content),
        "utf-8",
      );
    }

    console.log("Generated JSON file: output.draft.json");
  } catch (error) {
    console.error("Error generating JSON:", error);
  }
}

main();
