import { XmlParser } from '~/utils';

export type CellValue = string | number | boolean | null;

export function parseSharedStrings(xml: Uint8Array): string[] {
  if (!xml?.length) {
    return [];
  }

  const parser = new XmlParser(xml);

  // 3. 获取所有 <t> 节点内容
  const tNodes = parser.find('t');

  // 4. 返回文本数组
  return tNodes.map((node) => node.textContent || '');
}

export function parseSheet(
  sheetXml: Uint8Array,
  rawSharedStrings: Uint8Array
): CellValue[][] {
  const sharedStrings = parseSharedStrings(rawSharedStrings);
  const parser = new XmlParser(sheetXml);
  const domRows = parser.find('row');
  const rows: CellValue[][] = [];

  for (const rowEl of domRows) {
    const row: CellValue[] = [];
    const cellEls = rowEl.querySelectorAll('c');
    for (const cellEl of Array.from(cellEls)) {
      const t = cellEl.getAttribute('t');
      const v = cellEl.querySelector('v')?.textContent;

      let value: CellValue = null;
      if (v !== null) {
        if (t === 's') {
          value = sharedStrings[Number(v)];
        } else if (t === 'b') {
          value = v === '1';
        } else {
          value = Number(v);
        }
      }

      row.push(value);
    }
    rows.push(row);
  }

  return rows;
}
