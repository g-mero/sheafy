import { XmlParser } from '~/utils';

export type CellValue = string | number | boolean | null;

// Regex pattern for extracting column reference from cell reference
const COLUMN_PATTERN = /^([A-Z]+)/;
const ALPHABET_BASE = 26;
const A_CHAR_CODE = 64; // 'A' - 1

// Helper function to convert Excel column reference (A1, B1, etc.) to column index (0, 1, etc.)
function getColumnIndex(cellRef: string): number {
  const match = cellRef.match(COLUMN_PATTERN);
  if (!match) {
    return 0;
  }

  const columnRef = match[1];
  let result = 0;

  for (let i = 0; i < columnRef.length; i++) {
    result = result * ALPHABET_BASE + (columnRef.charCodeAt(i) - A_CHAR_CODE);
  }

  return result - 1; // Convert to 0-based index
}

export function parseSharedStrings(xml: Uint8Array): string[] {
  if (!xml?.length) {
    return [];
  }
  const parser = new XmlParser(xml);
  const tNodes = parser.find('t');
  return tNodes.map((node) => node.textContent || '');
}

// Helper function to parse a single cell element
function parseCellValue(cellEl: Element, sharedStrings: string[]): CellValue {
  const t = cellEl.getAttribute('t');
  const vElement = cellEl.querySelector('v');
  const v = vElement?.textContent;

  if (v === null || v === undefined) {
    return null;
  }

  if (t === 's') {
    // Use Number.parseInt for index lookup
    const index = Number.parseInt(v, 10);
    return sharedStrings[index] ?? null;
  }

  if (t === 'b') {
    return v === '1';
  }

  // Use Number.parseFloat for numeric values
  return Number.parseFloat(v);
}

export function parseSheet(
  sheetXml: Uint8Array,
  rawSharedStrings: Uint8Array
): CellValue[][] {
  // Early return for empty sheets
  if (!sheetXml?.length) {
    return [];
  }

  const sharedStrings = parseSharedStrings(rawSharedStrings);
  const parser = new XmlParser(sheetXml);
  const domRows = parser.find('row');

  // Early return if no rows found
  if (!domRows.length) {
    return [];
  }

  return domRows.map((rowEl) => {
    const cellEls = Array.from(rowEl.querySelectorAll('c'));

    // Find the maximum column index for this row
    let maxColumnIndex = 0;
    const cellData: { index: number; value: CellValue }[] = [];

    for (const cellEl of cellEls) {
      const cellRef = cellEl.getAttribute('r');
      if (!cellRef) {
        continue;
      }

      const columnIndex = getColumnIndex(cellRef);
      maxColumnIndex = Math.max(maxColumnIndex, columnIndex);

      const value = parseCellValue(cellEl, sharedStrings);
      cellData.push({ index: columnIndex, value });
    }

    // Create array with proper length and fill sparse positions with null
    const row: CellValue[] = new Array(maxColumnIndex + 1).fill(null);

    for (const { index, value } of cellData) {
      row[index] = value;
    }

    return row;
  });
}
