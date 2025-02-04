import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { convert } from "docen";
import { describe, expect, it } from "vitest";

describe("DOCX Conversion Tests", () => {
  const SAMPLE_PATH = join(__dirname, "../../examples/documents/sample.docx");

  it("should convert DOCX to PDF", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "pdf", { sourceFormat: "docx" });
    expect(result).toBeDefined();
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it("should convert DOCX to HTML", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "html", { sourceFormat: "docx" });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("<!DOCTYPE html>");
  });

  it("should convert DOCX to Markdown", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "md", { sourceFormat: "docx" });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should handle invalid DOCX file", async () => {
    const invalidSource = Buffer.from("invalid content");
    await expect(
      convert(invalidSource, "pdf", { sourceFormat: "docx" }),
    ).rejects.toThrow();
  });

  it("should handle conversion with custom options", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "pdf", {
      sourceFormat: "docx",
      options: {
        quality: "high",
        preserveImages: true,
      },
    });
    expect(result).toBeDefined();
    expect(Buffer.isBuffer(result)).toBe(true);
  });
});
