import type { XlsxSheetData } from '~/types/xlsx';
import { XmlParser } from '~/utils';
import { parseCellValue } from './parse-cell-value';
import { parseSharedStrings } from './parse-shared-strings';

export function parseSheet(
  sheetXml: Uint8Array,
  rawSharedStrings: Uint8Array
): XlsxSheetData {
  if (!sheetXml?.length) {
    return {};
  }

  const sharedStrings = parseSharedStrings(rawSharedStrings);
  const parser = new XmlParser(sheetXml);
  const domRows = parser.find('row');
  if (!domRows.length) {
    return {};
  }

  const result: XlsxSheetData = {};

  for (const rowEl of domRows) {
    const cellEls = rowEl.querySelectorAll('c');
    for (const cellEl of cellEls) {
      const cellRef = cellEl.getAttribute('r'); // A1, B2 ...
      if (!cellRef) {
        continue;
      }

      result[cellRef] = parseCellValue(cellEl, sharedStrings);
    }
  }

  return result;
}
