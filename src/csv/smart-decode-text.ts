/**
 * Detect BOM for UTF encodings
 */
/** biome-ignore-all lint/style/noMagicNumbers: not necessary */
function detectBOM(buffer: Uint8Array): string | null {
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return "utf-8";
  }
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    return "utf-16be";
  }
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return "utf-16le";
  }
  return null;
}

function tryDecode(
  buffer: ArrayBuffer,
  encoding: string,
  fatal = true
): string | null {
  try {
    const text = new TextDecoder(encoding, { fatal }).decode(buffer);
    return text.includes("\ufffd") ? null : text;
  } catch {
    return null;
  }
}

/**
 * Smart detection and decoding of text from ArrayBuffer
 */
export function smartDecodeText(arrayBuffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(arrayBuffer);

  // 1️⃣ Check BOM
  const bomEncoding = detectBOM(uint8);
  if (bomEncoding) {
    const text = tryDecode(arrayBuffer, bomEncoding);
    if (text !== null) {
      return text;
    }
  }

  // 2️⃣ Try UTF-8 first
  const utf8Text = tryDecode(arrayBuffer, "utf-8");
  if (utf8Text !== null) {
    return utf8Text;
  }

  // 3️⃣ Try common Chinese encodings
  const chineseEncodings = ["gbk", "gb2312", "big5"];
  for (const enc of chineseEncodings) {
    const text = tryDecode(arrayBuffer, enc);
    if (text !== null) {
      return text;
    }
  }

  // 4️⃣ Try other fallback encodings
  const fallbackEncodings = ["windows-1252", "iso-8859-1"];
  for (const enc of fallbackEncodings) {
    const text = tryDecode(arrayBuffer, enc);
    if (text !== null) {
      return text;
    }
  }

  // 5️⃣ Last resort: decode as UTF-8 non-fatal
  return new TextDecoder("utf-8", { fatal: false }).decode(arrayBuffer);
}
