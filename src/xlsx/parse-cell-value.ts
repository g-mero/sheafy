import type { XlsxCellValue } from "~/types/xlsx";

// Parse a single cell element
export function parseCellValue(
  cellEl: Element,
  sharedStrings: string[]
): XlsxCellValue {
  const t = cellEl.getAttribute("t");
  const vElement = cellEl.querySelector("v");
  const v = vElement?.textContent;

  if (v == null) {
    return null;
  }

  if (t === "s") {
    const index = Number.parseInt(v, 10);
    return sharedStrings[index] ?? null;
  }

  if (t === "b") {
    return v === "1";
  }

  return Number.parseFloat(v);
}
