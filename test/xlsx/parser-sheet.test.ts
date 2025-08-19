import { describe, expect, it } from 'vitest';
import { parseSheet } from '~/xlsx/parser-sheet';

describe('parseSheet', () => {
  it('should handle sparse cells and maintain column alignment', () => {
    // Test values for cell content
    const VALUE_A1 = 1;
    const VALUE_C1 = 3;
    const VALUE_E1 = 5;
    const VALUE_A2 = 10;
    const VALUE_B2 = 20;
    const VALUE_D2 = 40;

    // Column indices
    const COL_A = 0;
    const COL_B = 1;
    const COL_C = 2;
    const COL_D = 3;
    const COL_E = 4;

    // Row indices
    const ROW_1 = 0;
    const ROW_2 = 1;

    // Create mock XML for a sheet with sparse cells
    // Row has cells in columns A (0), C (2), and E (4), skipping B and D
    const sheetXml =
      new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1"><v>${VALUE_A1}</v></c>
      <c r="C1"><v>${VALUE_C1}</v></c>
      <c r="E1"><v>${VALUE_E1}</v></c>
    </row>
    <row r="2">
      <c r="A2"><v>${VALUE_A2}</v></c>
      <c r="B2"><v>${VALUE_B2}</v></c>
      <c r="D2"><v>${VALUE_D2}</v></c>
    </row>
  </sheetData>
</worksheet>`);

    const sharedStrings = new Uint8Array(); // Empty shared strings

    const result = parseSheet(sheetXml, sharedStrings);

    // First row: [1, null, 3, null, 5]
    expect(result[ROW_1]).toEqual([VALUE_A1, null, VALUE_C1, null, VALUE_E1]);

    // Second row: [10, 20, null, 40]
    expect(result[ROW_2]).toEqual([VALUE_A2, VALUE_B2, null, VALUE_D2]);

    // Verify that columns are properly aligned
    expect(result[ROW_1][COL_A]).toBe(VALUE_A1); // A1 = 1
    expect(result[ROW_1][COL_B]).toBe(null); // B1 = empty
    expect(result[ROW_1][COL_C]).toBe(VALUE_C1); // C1 = 3
    expect(result[ROW_1][COL_D]).toBe(null); // D1 = empty
    expect(result[ROW_1][COL_E]).toBe(VALUE_E1); // E1 = 5
  });

  it('should handle empty cells at the beginning of rows', () => {
    const TEST_VALUE_C1 = 100;
    const TEST_VALUE_D1 = 200;
    const EXPECTED_ROW_LENGTH = 4;
    const ROW_INDEX = 0;

    const sheetXml =
      new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="C1"><v>${TEST_VALUE_C1}</v></c>
      <c r="D1"><v>${TEST_VALUE_D1}</v></c>
    </row>
  </sheetData>
</worksheet>`);

    const sharedStrings = new Uint8Array();
    const result = parseSheet(sheetXml, sharedStrings);

    // Should be [null, null, 100, 200] - preserving alignment
    expect(result[ROW_INDEX]).toEqual([
      null,
      null,
      TEST_VALUE_C1,
      TEST_VALUE_D1,
    ]);
    expect(result[ROW_INDEX].length).toBe(EXPECTED_ROW_LENGTH);
  });
});
