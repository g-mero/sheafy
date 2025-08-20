export class XmlParser {
  readonly dom: Document;
  constructor(xmlRaw: Uint8Array) {
    this.dom = this.parseXml(xmlRaw);
  }

  private parseXml(xmlRaw: Uint8Array): Document {
    const parser = new DOMParser();
    const xmlString = new TextDecoder().decode(xmlRaw);
    return parser.parseFromString(xmlString, 'application/xml');
  }

  find(selectors: string) {
    return this.dom.querySelectorAll(selectors);
  }

  findFirst(selectors: string) {
    return this.dom.querySelector(selectors);
  }
}
