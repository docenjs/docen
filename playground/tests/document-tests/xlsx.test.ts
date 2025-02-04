import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { convert } from "docen";
import { describe, expect, it } from "vitest";

describe("XLSX Conversion Tests", () => {
  const SAMPLE_PATH = join(__dirname, "../../examples/documents/sample.xlsx");

  it("should convert XLSX to CSV", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "csv", { sourceFormat: "xlsx" });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain(","); // CSV should contain commas
  });

  it("should convert XLSX to JSON", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "json", { sourceFormat: "xlsx" });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    const parsed = JSON.parse(result as string);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("should convert XLSX to HTML table", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "html", { sourceFormat: "xlsx" });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain("<table");
  });

  it("should handle invalid XLSX file", async () => {
    const invalidSource = Buffer.from("invalid content");
    await expect(
      convert(invalidSource, "csv", { sourceFormat: "xlsx" }),
    ).rejects.toThrow();
  });

  it("should handle XLSX with multiple sheets", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "json", {
      sourceFormat: "xlsx",
      options: {
        sheet: "Sheet1",
        includeHeaders: true,
      },
    });
    expect(result).toBeDefined();
    const parsed = JSON.parse(result as string);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("should handle XLSX with formatting options", async () => {
    const source = await readFile(SAMPLE_PATH);
    const result = await convert(source, "csv", {
      sourceFormat: "xlsx",
      options: {
        delimiter: ";",
        includeHeaders: true,
        dateFormat: "YYYY-MM-DD",
      },
    });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    expect(result).toContain(";"); // Custom delimiter
  });
});
