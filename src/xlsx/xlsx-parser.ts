import type { XlsxSheetData } from "~/types/xlsx";
import { isNumber } from "~/utils";
import { parseSheet } from "./parse-sheet";
import { parseWorkbook, parseWorkbookRels } from "./parse-workbook";
import { sheetDataToMatrix } from "./sheet-data-to-matrix";
import { unzipXlsx, type XlsxRawData } from "./unzip-xlsx";

export class XlsxParser {
  private isInitialized = false;
  private readonly data:
    | Uint8Array
    | ArrayBuffer
    | Promise<Uint8Array | ArrayBuffer>;
  private parsedRawData?: XlsxRawData;
  // sheetName : filePath
  private readonly sheets: Record<string, string> = {};
  private readonly sheetsData: Record<string, XlsxSheetData> = {};
  constructor(
    data: Uint8Array | ArrayBuffer | Promise<Uint8Array | ArrayBuffer>
  ) {
    this.data = data;
  }

  private async getSheetRawData(sheetName: string): Promise<Uint8Array> {
    const filePath = await this.getSheetPath(sheetName);
    if (!filePath) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }
    const rowData = await this.getRawData();
    return rowData.sheets[filePath];
  }

  private async getRawData() {
    if (!this.parsedRawData) {
      this.parsedRawData = await unzipXlsx(await this.data);
    }
    return this.parsedRawData;
  }

  private async initialSheets() {
    if (this.isInitialized) {
      return;
    }
    const rawData = await this.getRawData();
    const workbook = parseWorkbook(rawData.workbook);
    const rels = parseWorkbookRels(rawData.rels);
    for (const sheetInfo of workbook) {
      const sheetName = sheetInfo.name;
      const filePath = rels[sheetInfo.rId];
      this.sheets[sheetName] = filePath;
    }
    this.isInitialized = true;
  }

  private async sheetDataCheck(sheetName: string) {
    const rawData = await this.getRawData();
    if (!this.sheetsData[sheetName]) {
      this.sheetsData[sheetName] = parseSheet(
        await this.getSheetRawData(sheetName),
        rawData.sharedStrings
      );
    }
  }

  private async getSheetPath(sheetName: string) {
    await this.initialSheets();
    const filePath = this.sheets[sheetName];
    if (!filePath) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }
    return filePath;
  }

  async getAllSheets() {
    await this.initialSheets();
    return Object.keys(this.sheets);
  }

  async readSheet(sheetNameOrIndex: string | number) {
    const sheetName: string = isNumber(sheetNameOrIndex)
      ? (await this.getAllSheets())[sheetNameOrIndex]
      : sheetNameOrIndex;

    if (!sheetName) {
      throw new Error(`Sheet not found: ${sheetNameOrIndex}`);
    }

    await this.sheetDataCheck(sheetName);
    return sheetDataToMatrix(this.sheetsData[sheetName]);
  }

  async getCellValue(cellRef: string, sheetNameOrIndex: string | number = 0) {
    const sheets = await this.getAllSheets();
    const sheetName: string = isNumber(sheetNameOrIndex)
      ? sheets[sheetNameOrIndex]
      : sheetNameOrIndex;

    if (!sheetName) {
      return null;
    }

    await this.sheetDataCheck(sheetName);
    return this.sheetsData[sheetName][cellRef];
  }
}

export function newXlsxParser(data: Uint8Array | ArrayBuffer) {
  return new XlsxParser(data);
}

export function newXlsxParserFromFile(file: File) {
  return new XlsxParser(file.arrayBuffer());
}
