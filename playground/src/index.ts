import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Get current directory using import.meta.url for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (existsSync(path.join(__dirname, "..", "drafts"))) {
  rmSync(path.join(__dirname, "..", "drafts"), { recursive: true });
}

mkdirSync(path.join(__dirname, "..", "drafts"), { recursive: true });

async function runAllExamples() {
  console.log("--- Running All Docen Playground Examples ---");
  const examplesDir = path.join(__dirname, "examples");
  let successCount = 0;
  let failureCount = 0;

  try {
    const files = readdirSync(examplesDir);
    const exampleFiles = files.filter(
      (file) => file.endsWith(".ts") && !file.endsWith(".d.ts"),
    );

    if (exampleFiles.length === 0) {
      console.warn("No example files found in", examplesDir);
      return;
    }

    console.log(
      `Found ${exampleFiles.length} example(s): ${exampleFiles.join(", ")}\n`,
    );

    for (const file of exampleFiles) {
      const examplePath = path.join(examplesDir, file);
      try {
        console.log(`--- Running ${file} ---`);
        const exampleModule = await import(examplePath);
        if (typeof exampleModule.default === "function") {
          await exampleModule.default(); // Execute the default export function
          console.log(`--- Finished ${file} Successfully ---`);
          successCount++;
        } else {
          console.warn(`Skipping ${file}: No default export function found.`);
        }
      } catch (error) {
        console.error(`--- Failed ${file} ---`);
        console.error("Error details:", error);
        failureCount++;
      }
      console.log("\n"); // Add spacing between examples
    }
  } catch (error) {
    console.error("Error reading examples directory:", error);
    process.exit(1);
  }

  console.log("--- Playground Run Complete ---");
  console.log(
    `Total: ${successCount + failureCount}, Success: ${successCount}, Failed: ${failureCount}`,
  );
  if (failureCount > 0) {
    process.exit(1); // Exit with error code if any example failed
  }
}

runAllExamples().catch((err) => {
  console.error("An unexpected error occurred in the main runner:", err);
  process.exit(1);
});
