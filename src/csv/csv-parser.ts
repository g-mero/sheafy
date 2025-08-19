export interface CsvParseOptions {
  delimiter?: string;
  quote?: string;
  escape?: string;
  newline?: string;
  skipEmptyLines?: boolean;
  trimFields?: boolean;
  headers?: boolean;
  encoding?: string;
}

export interface CsvData {
  headers?: string[];
  rows: string[][];
}

export class CsvParser {
  private readonly text: string;
  private readonly options: Required<CsvParseOptions>;

  constructor(text: string, options: CsvParseOptions = {}) {
    this.text = text;
    this.options = {
      delimiter: options.delimiter ?? ',',
      quote: options.quote ?? '"',
      escape: options.escape ?? '"',
      newline: options.newline ?? '\n',
      skipEmptyLines: options.skipEmptyLines ?? true,
      trimFields: options.trimFields ?? false,
      headers: options.headers ?? false,
      encoding: options.encoding ?? 'utf-8',
    };
  }

  parse(): CsvData {
    const rows = this.parseText();

    if (this.options.headers && rows.length > 0) {
      const headers = rows.shift();
      return { headers, rows };
    }

    return { rows };
  }

  private parseText(): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < this.text.length) {
      const char = this.text[i];

      if (inQuotes) {
        const result = this.handleQuotedCharacter(this.text, i, currentField);
        currentField = result.field;
        inQuotes = result.stillInQuotes;
        i = result.nextIndex;
        continue;
      }

      if (char === this.options.quote) {
        inQuotes = true;
        i++;
      } else if (char === this.options.delimiter) {
        currentRow.push(this.processField(currentField));
        currentField = '';
        i++;
      } else if (this.isNewline(char)) {
        currentRow.push(this.processField(currentField));
        this.addRowIfNotEmpty(currentRow, rows);
        currentRow = [];
        currentField = '';
        i = this.skipNewlineSequence(i);
      } else {
        currentField += char;
        i++;
      }
    }

    // Add the last field and row if they exist
    this.finalizeLastRow(currentField, currentRow, rows);
    return rows;
  }

  private addRowIfNotEmpty(row: string[], rows: string[][]) {
    if (!this.shouldSkipRow(row)) {
      rows.push([...row]); // Create a copy
    }
  }

  private skipNewlineSequence(index: number): number {
    const char = this.text[index];
    // Handle \r\n sequence
    if (
      char === '\r' &&
      index + 1 < this.text.length &&
      this.text[index + 1] === '\n'
    ) {
      return index + 2;
    }
    return index + 1;
  }

  private finalizeLastRow(
    currentField: string,
    currentRow: string[],
    rows: string[][]
  ) {
    if (currentField || currentRow.length > 0) {
      currentRow.push(this.processField(currentField));
      if (!this.shouldSkipRow(currentRow)) {
        rows.push(currentRow);
      }
    }
  }

  private isNewline(char: string): boolean {
    return char === '\n' || char === '\r';
  }

  private shouldSkipRow(row: string[]): boolean {
    if (!this.options.skipEmptyLines) {
      return false;
    }

    // Skip if all fields are empty or whitespace
    return row.every((field) => field.trim() === '');
  }

  private handleQuotedCharacter(
    line: string,
    index: number,
    currentField: string
  ) {
    const char = line[index];
    const nextChar = index + 1 < line.length ? line[index + 1] : '';

    if (char === this.options.escape && nextChar === this.options.quote) {
      return {
        field: currentField + this.options.quote,
        stillInQuotes: true,
        nextIndex: index + 2,
      };
    }

    if (char === this.options.quote && nextChar === this.options.quote) {
      return {
        field: currentField + this.options.quote,
        stillInQuotes: true,
        nextIndex: index + 2,
      };
    }

    if (char === this.options.quote) {
      return {
        field: currentField,
        stillInQuotes: false,
        nextIndex: index + 1,
      };
    }

    return {
      field: currentField + char,
      stillInQuotes: true,
      nextIndex: index + 1,
    };
  }

  private processField(field: string): string {
    return this.options.trimFields ? field.trim() : field;
  }
}

export function newCsvParser(
  text: string,
  options?: CsvParseOptions
): CsvParser {
  return new CsvParser(text, options);
}

export async function newCsvParserFromFile(
  file: File,
  options?: CsvParseOptions
): Promise<CsvParser> {
  const text = await readFileWithEncoding(file, options?.encoding);
  return new CsvParser(text, options);
}

/**
 * Read file content with specified encoding
 */
async function readFileWithEncoding(
  file: File,
  encoding = 'utf-8'
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Try to detect encoding if not specified or if utf-8 fails
  if (encoding === 'auto') {
    return detectAndDecodeText(arrayBuffer);
  }

  try {
    const decoder = new TextDecoder(encoding);
    return decoder.decode(arrayBuffer);
  } catch {
    // If specified encoding fails, try common encodings for Chinese text
    return detectAndDecodeText(arrayBuffer);
  }
}

/**
 * Attempt to detect encoding and decode text
 */
function detectAndDecodeText(arrayBuffer: ArrayBuffer): string {
  // Common encodings to try, especially for Chinese text
  const encodingsToTry = [
    'utf-8',
    'gbk',
    'gb2312',
    'big5',
    'windows-1252',
    'iso-8859-1',
  ];

  for (const encoding of encodingsToTry) {
    try {
      const decoder = new TextDecoder(encoding, { fatal: true });
      const text = decoder.decode(arrayBuffer);

      // Check if the decoded text contains valid characters (not replacement characters)
      if (!text.includes('\ufffd')) {
        return text;
      }
    } catch {
      // Try next encoding
    }
  }

  // If all encodings fail, fall back to utf-8 with non-fatal decoding
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return decoder.decode(arrayBuffer);
}

export function parseCSV(text: string, options?: CsvParseOptions): CsvData {
  const parser = new CsvParser(text, options);
  return parser.parse();
}

export async function parseCSVFromFile(
  file: File,
  options?: CsvParseOptions
): Promise<CsvData> {
  const parser = await newCsvParserFromFile(file, options);
  return parser.parse();
}
