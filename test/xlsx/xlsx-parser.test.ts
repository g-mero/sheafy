import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { newXlsxParser } from '~/xlsx';

describe('XLSX Parser', () => {
  it('should parse basic XLSX data', async () => {
    const file = readFileSync('./test/assets/xlsx_data.xlsx');
    const parser = newXlsxParser(new Uint8Array(file));
    const sheets = await parser.getAllSheets();
    const cellValue = await parser.getCellValue('A1');
    const cellValue2 = await parser.getCellValue('A1', '表2');

    expect(sheets).toEqual(['Sheet1', '表2']);
    expect(cellValue).toEqual('header1');
    expect(cellValue2).toEqual('头1');
  });
});
