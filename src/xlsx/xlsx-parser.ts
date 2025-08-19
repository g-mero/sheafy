import { parseSheet } from './parser-sheet';
import { parseWorkbook, parseWorkbookRels } from './parser-workbook';
import { unzipXlsx, type XlsxRawData } from './unzip-xlsx';

export class XlsxParser {
  readonly data: Uint8Array | ArrayBuffer;
  private parsedRawData?: XlsxRawData;
  // sheetName : filePath
  private readonly sheets: Record<string, string> = {};
  constructor(data: Uint8Array | ArrayBuffer) {
    this.data = data;
  }

  private async getRawData() {
    if (!this.parsedRawData) {
      this.parsedRawData = await unzipXlsx(this.data);
    }
    return this.parsedRawData;
  }

  private async initialSheets() {
    const rawData = await this.getRawData();
    const workbook = parseWorkbook(rawData.workbook);
    const rels = parseWorkbookRels(rawData.rels);
    for (const sheetInfo of workbook) {
      const sheetName = sheetInfo.name;
      const filePath = rels[sheetInfo.rId];
      this.sheets[sheetName] = filePath;
    }
  }

  private async getSheetPath(sheetName: string) {
    if (!Object.keys(this.sheets).length) {
      await this.initialSheets();
    }
    const filePath = this.sheets[sheetName];
    if (!filePath) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }
    return filePath;
  }

  async getAllSheets() {
    if (!Object.keys(this.sheets).length) {
      await this.initialSheets();
    }
    return Object.keys(this.sheets);
  }

  async readSheet(sheetName: string) {
    const filePath = await this.getSheetPath(sheetName);
    const rawData = await this.getRawData();
    return parseSheet(rawData.sheets[filePath], rawData.sharedStrings);
  }
}

export function newXlsxParser(data: Uint8Array | ArrayBuffer) {
  return new XlsxParser(data);
}

export async function newXlsxParserFromFile(file: File) {
  return new XlsxParser(await file.arrayBuffer());
}
