import { describe, expect, it } from 'vitest';
import { parseSheet } from '~/xlsx/parse-sheet';
import { sheetDataToMatrix } from '~/xlsx/sheet-data-to-matrix';

describe('parseSheet', () => {
  it('should parse sheet XML into cell reference object', () => {
    const VALUE_A1 = 1;
    const VALUE_C1 = 3;
    const VALUE_E1 = 5;
    const VALUE_A2 = 10;
    const VALUE_B2 = 20;
    const VALUE_D2 = 40;

    // Create mock XML for a sheet with sparse cells
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

    // Should return object with cell references as keys
    expect(result).toEqual({
      A1: VALUE_A1,
      C1: VALUE_C1,
      E1: VALUE_E1,
      A2: VALUE_A2,
      B2: VALUE_B2,
      D2: VALUE_D2,
    });

    // Verify individual cells
    expect(result.A1).toBe(VALUE_A1);
    expect(result.C1).toBe(VALUE_C1);
    expect(result.E1).toBe(VALUE_E1);
    expect(result.A2).toBe(VALUE_A2);
    expect(result.B2).toBe(VALUE_B2);
    expect(result.D2).toBe(VALUE_D2);

    // Non-existent cells should be undefined
    expect(result.B1).toBeUndefined();
    expect(result.D1).toBeUndefined();
    expect(result.C2).toBeUndefined();
    expect(result.E2).toBeUndefined();
  });

  it('should handle empty sheet XML', () => {
    const emptySheetXml =
      new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
  </sheetData>
</worksheet>`);

    const sharedStrings = new Uint8Array();
    const result = parseSheet(emptySheetXml, sharedStrings);

    expect(result).toEqual({});
  });

  it('should handle null or empty input', () => {
    const result1 = parseSheet(new Uint8Array(), new Uint8Array());
    const result2 = parseSheet(null as unknown as Uint8Array, new Uint8Array());

    expect(result1).toEqual({});
    expect(result2).toEqual({});
  });

  it('should skip cells without reference attribute', () => {
    const sheetXml =
      new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1"><v>1</v></c>
      <c><v>2</v></c>
      <c r="B1"><v>3</v></c>
    </row>
  </sheetData>
</worksheet>`);

    const sharedStrings = new Uint8Array();
    const result = parseSheet(sheetXml, sharedStrings);

    expect(result).toEqual({
      A1: 1,
      B1: 3,
    });
    // Cell without reference should be skipped
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('should handle string cells with shared strings', () => {
    const sharedStringsXml =
      new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <si><t>Hello</t></si>
  <si><t>World</t></si>
</sst>`);

    const sheetXml =
      new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="s"><v>0</v></c>
      <c r="B1" t="s"><v>1</v></c>
    </row>
  </sheetData>
</worksheet>`);

    const result = parseSheet(sheetXml, sharedStringsXml);

    expect(result).toEqual({
      A1: 'Hello',
      B1: 'World',
    });
  });
});

describe('parseSheet integration with sheetDataToMatrix', () => {
  it('should convert parsed sheet data to matrix correctly', () => {
    const VALUE_A1 = 1;
    const VALUE_C1 = 3;
    const VALUE_E1 = 5;
    const VALUE_A2 = 10;
    const VALUE_B2 = 20;
    const VALUE_D2 = 40;
    const EXPECTED_ROWS = 2;
    const EXPECTED_COLS = 5; // A through E

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

    const sharedStrings = new Uint8Array();
    const sheetData = parseSheet(sheetXml, sharedStrings);
    const matrix = sheetDataToMatrix(sheetData);

    // First row (0-indexed): [1, null, 3, null, 5]
    expect(matrix[0]).toEqual([VALUE_A1, null, VALUE_C1, null, VALUE_E1]);

    // Second row (0-indexed): [10, 20, null, 40, null] - padded to match max columns
    expect(matrix[1]).toEqual([VALUE_A2, VALUE_B2, null, VALUE_D2, null]);

    // Verify matrix dimensions
    expect(matrix).toHaveLength(EXPECTED_ROWS);
    expect(matrix[0]).toHaveLength(EXPECTED_COLS);
    expect(matrix[1]).toHaveLength(EXPECTED_COLS);
  });

  it('should handle sparse data starting from non-A columns', () => {
    const TEST_VALUE_C1 = 100;
    const TEST_VALUE_D1 = 200;
    const EXPECTED_COLS = 4; // Columns A, B, C, D

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
    const sheetData = parseSheet(sheetXml, sharedStrings);
    const matrix = sheetDataToMatrix(sheetData);

    // Should be [null, null, 100, 200] - preserving alignment
    expect(matrix[0]).toEqual([null, null, TEST_VALUE_C1, TEST_VALUE_D1]);
    expect(matrix[0]).toHaveLength(EXPECTED_COLS);
  });

  it('should handle empty sheet data conversion', () => {
    const emptySheetData = parseSheet(new Uint8Array(), new Uint8Array());
    const matrix = sheetDataToMatrix(emptySheetData);

    expect(matrix).toEqual([]);
  });
});
