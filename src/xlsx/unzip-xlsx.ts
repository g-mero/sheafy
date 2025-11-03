import { asyncUnzip } from "~/utils/unzip-async";

export type XlsxRawData = {
  styles: Uint8Array;
  workbook: Uint8Array;
  sharedStrings: Uint8Array;
  rels: Uint8Array;
  sheets: Record<string, Uint8Array>;
};

export async function unzipXlsx(
  buffer: ArrayBuffer | Uint8Array
): Promise<XlsxRawData> {
  let buf: Uint8Array = buffer as Uint8Array;
  if (buffer instanceof ArrayBuffer) {
    buf = new Uint8Array(buffer);
  }
  const files = await asyncUnzip(buf);
  const sheets: Record<string, Uint8Array> = {};

  for (const [key, value] of Object.entries(files)) {
    if (key.startsWith("xl/worksheets/sheet")) {
      sheets[key] = value;
    }
  }

  return {
    styles: files["xl/styles.xml"] || new Uint8Array(),
    workbook: files["xl/workbook.xml"] || new Uint8Array(),
    sharedStrings: files["xl/sharedStrings.xml"] || new Uint8Array(),
    rels: files["xl/_rels/workbook.xml.rels"] || new Uint8Array(),
    sheets,
  };
}
