import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { newXlsxParser } from '~/xlsx';

describe('XLSX Parser', () => {
  it('should parse basic XLSX data', async () => {
    const file = readFileSync('./test/assets/test_normal.xlsx');
    const parser = newXlsxParser(new Uint8Array(file));
    const sheets = await parser.getAllSheets();

    expect(sheets).toEqual(['Sheet1', '表2']);
  });
});
