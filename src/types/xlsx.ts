export type XlsxCellValue = string | number | boolean | null;
export type XlsxRef = string;
export type XlsxSheetData = Record<XlsxRef, XlsxCellValue>;
