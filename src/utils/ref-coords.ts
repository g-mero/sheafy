const CHAR_CODE_A = 65;
const EXCEL_COL_OFFSET = CHAR_CODE_A - 1; // 64
const EXCEL_ALPHABET_LENGTH = 26; // A - Z

/**
 * Convert Excel cell reference (e.g. "A1") into one-based { row, col }
 *
 * @example
 *
 * ```
 * refToCoords("A1"); // { row: 1, col: 1 }
 * ```
 */
export function refToCoords(ref: string): { row: number; col: number } {
  const match = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }

  const [, colLetters, rowDigits] = match;

  const row = Number(rowDigits);
  if (row <= 0) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }

  let col = 0;
  for (let i = 0; i < colLetters.length; i++) {
    col =
      col * EXCEL_ALPHABET_LENGTH +
      (colLetters.charCodeAt(i) - EXCEL_COL_OFFSET); // 'A' → 1
  }

  return {
    row, // one-based
    col, // one-based
  };
}

/**
 * Convert one-based { row, col } back to Excel cell reference (e.g. "A1")
 *
 * @example
 *
 * ```
 * coordsToRef({ row: 1, col: 1 }); // "A1"
 * ```
 */
export function coordsToRef({
  row,
  col,
}: {
  row: number;
  col: number;
}): string {
  if (row <= 0 || col <= 0) {
    throw new Error("Row and column must be positive (1-based)");
  }

  let colLetters = "";
  let n = col;
  while (n > 0) {
    const rem = (n - 1) % EXCEL_ALPHABET_LENGTH;
    colLetters = String.fromCharCode(CHAR_CODE_A + rem) + colLetters; // 65 = 'A'
    n = Math.floor((n - 1) / EXCEL_ALPHABET_LENGTH);
  }

  return `${colLetters}${row}`;
}
