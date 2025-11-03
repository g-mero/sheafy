import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { newCsvParser, parseCSV, parseCSVFromFile } from "~/csv/csv-parser";

describe("CSV Parser", () => {
  it("should parse basic CSV data", () => {
    const csvText = "name,age,city\nJohn,30,New York\nJane,25,Boston";
    const result = parseCSV(csvText, { headers: true });

    expect(result.headers).toEqual(["name", "age", "city"]);
    expect(result.rows).toEqual([
      ["John", "30", "New York"],
      ["Jane", "25", "Boston"],
    ]);
  });

  it("should parse CSV without headers", () => {
    const csvText = "John,30,New York\nJane,25,Boston";
    const result = parseCSV(csvText);

    expect(result.headers).toBeUndefined();
    expect(result.rows).toEqual([
      ["John", "30", "New York"],
      ["Jane", "25", "Boston"],
    ]);
  });

  it("should handle quoted fields", () => {
    const csvText =
      'name,description\n"John Doe","A person with, commas"\n"Jane Smith","Another person"';
    const result = parseCSV(csvText, { headers: true });

    expect(result.headers).toEqual(["name", "description"]);
    expect(result.rows).toEqual([
      ["John Doe", "A person with, commas"],
      ["Jane Smith", "Another person"],
    ]);
  });

  it("should handle escaped quotes", () => {
    const csvText =
      'name,quote\n"John","He said ""Hello"""\n"Jane","She said ""Hi"""';
    const result = parseCSV(csvText, { headers: true });

    expect(result.headers).toEqual(["name", "quote"]);
    expect(result.rows).toEqual([
      ["John", 'He said "Hello"'],
      ["Jane", 'She said "Hi"'],
    ]);
  });

  it("should handle different delimiters", () => {
    const csvText = "name;age;city\nJohn;30;New York\nJane;25;Boston";
    const result = parseCSV(csvText, { delimiter: ";", headers: true });

    expect(result.headers).toEqual(["name", "age", "city"]);
    expect(result.rows).toEqual([
      ["John", "30", "New York"],
      ["Jane", "25", "Boston"],
    ]);
  });

  it("should skip empty lines when option is enabled", () => {
    const csvText = "name,age\nJohn,30\n\nJane,25\n";
    const result = parseCSV(csvText, { headers: true, skipEmptyLines: true });

    expect(result.headers).toEqual(["name", "age"]);
    expect(result.rows).toEqual([
      ["John", "30"],
      ["Jane", "25"],
    ]);
  });

  it("should trim fields when option is enabled", () => {
    const csvText =
      "name, age , city \n John , 30 , New York \n Jane , 25 , Boston ";
    const result = parseCSV(csvText, { headers: true, trimFields: true });

    expect(result.headers).toEqual(["name", "age", "city"]);
    expect(result.rows).toEqual([
      ["John", "30", "New York"],
      ["Jane", "25", "Boston"],
    ]);
  });

  it("should handle newlines in quoted fields", () => {
    const csvText =
      'name,description\n"John","Line 1\nLine 2"\n"Jane","Single line"';
    const result = parseCSV(csvText, { headers: true });

    expect(result.headers).toEqual(["name", "description"]);
    expect(result.rows).toEqual([
      ["John", "Line 1\nLine 2"],
      ["Jane", "Single line"],
    ]);
  });

  it("should create parser instance", () => {
    const csvText = "name,age\nJohn,30";
    const parser = newCsvParser(csvText, { headers: true });
    const result = parser.parse();

    expect(result.headers).toEqual(["name", "age"]);
    expect(result.rows).toEqual([["John", "30"]]);
  });

  it("should parse csv from file with auto encoding", async () => {
    const csv = readFileSync("./test/assets/csv_data_ansi.csv");
    const result = await parseCSVFromFile(
      {
        arrayBuffer() {
          return Promise.resolve(csv);
        },
      } as unknown as File,
      {
        headers: true,
        encoding: "auto",
      }
    );

    expect(result.headers).toEqual(["name", "age", "city", "职务"]);
  });

  it("should parse tsv from file with auto encoding", async () => {
    const csv = readFileSync("./test/assets/tsv_data.tsv");
    const result = await parseCSVFromFile(
      {
        arrayBuffer() {
          return Promise.resolve(csv);
        },
      } as unknown as File,
      {
        headers: true,
        delimiter: "\t",
      }
    );

    expect(result.headers).toEqual(["id", "name", "age", "email"]);
  });
});
