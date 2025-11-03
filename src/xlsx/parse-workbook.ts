import { XmlParser } from "~/utils";

export type SheetInfo = {
  name: string;
  sheetId: string;
  rId: string;
};

export function parseWorkbook(workbookXmlRaw: Uint8Array) {
  const parser = new XmlParser(workbookXmlRaw);

  const sheets: SheetInfo[] = [];
  const sheetElements = parser.find("sheet");
  for (const sheetEl of sheetElements) {
    const name = sheetEl.getAttribute("name");
    const sheetId = sheetEl.getAttribute("sheetId");
    const rId = sheetEl.getAttribute("r:id");

    if (name && sheetId && rId) {
      sheets.push({ name, sheetId, rId });
    }
  }

  return sheets;
}

type WorkbookRels = Record<string, string>;

/**
 * Parses the workbook relationships XML.
 * @param workbookRelsXmlRaw xl/_rels/workbook.xml.rels
 * @returns Record<rId, filePath>
 */
export function parseWorkbookRels(
  workbookRelsXmlRaw: Uint8Array
): WorkbookRels {
  const parser = new XmlParser(workbookRelsXmlRaw);

  const rels: WorkbookRels = {};

  for (const rel of parser.find("Relationship")) {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    if (id && target) {
      rels[id] = target.startsWith("worksheets/") ? `xl/${target}` : target;
    }
  }

  return rels;
}
