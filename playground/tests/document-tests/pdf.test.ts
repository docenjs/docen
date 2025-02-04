import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { convert } from "docen";
import { describe, expect, it } from "vitest";

describe("PDF Conversion Tests", () => {
  const SAMPLE_PATH = join(__dirname, "../../examples/documents/sample.pdf");

  it("should convert PDF to DOCX", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "docx", { sourceFormat: "pdf" });
    expect(result).toBeDefined();
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it("should convert PDF to HTML", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "html", { sourceFormat: "pdf" });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("<!DOCTYPE html>");
  });

  it("should convert PDF to Text", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "txt", { sourceFormat: "pdf" });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should handle invalid PDF file", async () => {
    const invalidSource = Buffer.from("invalid content");
    await expect(
      convert(invalidSource, "docx", { sourceFormat: "pdf" }),
    ).rejects.toThrow();
  });

  it("should handle PDF with images", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "docx", {
      sourceFormat: "pdf",
      options: {
        extractImages: true,
        imageQuality: "high",
      },
    });
    expect(result).toBeDefined();
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it("should handle PDF with custom page range", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "docx", {
      sourceFormat: "pdf",
      options: {
        startPage: 1,
        endPage: 2,
      },
    });
    expect(result).toBeDefined();
    expect(Buffer.isBuffer(result)).toBe(true);
  });
});
