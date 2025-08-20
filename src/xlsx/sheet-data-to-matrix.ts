import type { XlsxCellValue, XlsxSheetData } from '~/types/xlsx';
import { refToCoords } from '~/utils';

export function sheetDataToMatrix(data: XlsxSheetData): XlsxCellValue[][] {
  let maxRow = 0;
  let maxCol = 0;

  for (const key of Object.keys(data)) {
    const { row, col } = refToCoords(key);
    if (row > maxRow) {
      maxRow = row;
    }
    if (col > maxCol) {
      maxCol = col;
    }
  }

  // initialize a 2D array (convert to 0-based indexing)
  const matrix: XlsxCellValue[][] = Array.from({ length: maxRow }, () =>
    new Array(maxCol).fill(null)
  );

  // fill the data
  for (const [key, value] of Object.entries(data)) {
    const { row, col } = refToCoords(key);
    matrix[row - 1][col - 1] = value; // Convert to 0-based indexing
  }

  return matrix;
}
