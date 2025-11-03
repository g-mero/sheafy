import { XmlParser } from "~/utils";

// Parse sharedStrings.xml -> string[]
export function parseSharedStrings(xml: Uint8Array): string[] {
  if (!xml?.length) {
    return [];
  }

  const parser = new XmlParser(xml);
  const siNodes = parser.find("si");
  const result: string[] = [];

  for (const si of siNodes) {
    const tNodes = si.querySelectorAll("t");
    let text = "";
    for (const t of Array.from(tNodes)) {
      text += t.textContent || "";
    }
    result.push(text);
  }

  return result;
}
