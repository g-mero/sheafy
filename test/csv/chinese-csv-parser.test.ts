import { describe, expect, test } from "vitest";
import { parseCSV } from "../../src/csv/csv-parser";

describe("CSV Parser - Chinese Characters", () => {
  test("should parse CSV with Chinese characters", () => {
    const csvText = `姓名,年龄,城市
张三,30,北京
李四,25,上海
王五,35,广州`;

    const result = parseCSV(csvText, { headers: true });

    expect(result.headers).toEqual(["姓名", "年龄", "城市"]);
    expect(result.rows).toEqual([
      ["张三", "30", "北京"],
      ["李四", "25", "上海"],
      ["王五", "35", "广州"],
    ]);
  });

  test("should parse mixed Chinese and English CSV", () => {
    const csvText = `name,姓名,age,年龄,city,城市
John,约翰,30,三十,New York,纽约
Jane,简,25,二十五,Boston,波士顿`;

    const result = parseCSV(csvText, { headers: true });

    expect(result.headers).toEqual([
      "name",
      "姓名",
      "age",
      "年龄",
      "city",
      "城市",
    ]);
    expect(result.rows).toEqual([
      ["John", "约翰", "30", "三十", "New York", "纽约"],
      ["Jane", "简", "25", "二十五", "Boston", "波士顿"],
    ]);
  });

  test("should handle Chinese characters with quotes and commas", () => {
    const csvText = `姓名,描述
"张三","一个来自北京的人，年龄30岁"
"李四","住在上海，从事IT工作"`;

    const result = parseCSV(csvText, { headers: true });

    expect(result.headers).toEqual(["姓名", "描述"]);
    expect(result.rows).toEqual([
      ["张三", "一个来自北京的人，年龄30岁"],
      ["李四", "住在上海，从事IT工作"],
    ]);
  });

  test("should handle Chinese characters with various delimiters", () => {
    const csvText = `姓名;年龄;城市
张三;30;北京
李四;25;上海`;

    const result = parseCSV(csvText, { headers: true, delimiter: ";" });

    expect(result.headers).toEqual(["姓名", "年龄", "城市"]);
    expect(result.rows).toEqual([
      ["张三", "30", "北京"],
      ["李四", "25", "上海"],
    ]);
  });
});
