import { describe, expect, it } from "vitest";
import { coordsToRef, refToCoords } from "~/utils";

describe("refToCoords", () => {
  describe("basic conversions", () => {
    it("should convert A1 to { row: 1, col: 1 }", () => {
      expect(refToCoords("A1")).toEqual({ row: 1, col: 1 });
    });

    it("should convert B2 to { row: 2, col: 2 }", () => {
      expect(refToCoords("B2")).toEqual({ row: 2, col: 2 });
    });

    it("should convert Z26 to { row: 26, col: 26 }", () => {
      expect(refToCoords("Z26")).toEqual({ row: 26, col: 26 });
    });
  });

  describe("multi-letter columns", () => {
    it("should convert AA1 to { row: 1, col: 27 }", () => {
      expect(refToCoords("AA1")).toEqual({ row: 1, col: 27 });
    });

    it("should convert AB1 to { row: 1, col: 28 }", () => {
      expect(refToCoords("AB1")).toEqual({ row: 1, col: 28 });
    });

    it("should convert AZ1 to { row: 1, col: 52 }", () => {
      expect(refToCoords("AZ1")).toEqual({ row: 1, col: 52 });
    });

    it("should convert BA1 to { row: 1, col: 53 }", () => {
      expect(refToCoords("BA1")).toEqual({ row: 1, col: 53 });
    });

    it("should convert ZZ1 to { row: 1, col: 702 }", () => {
      expect(refToCoords("ZZ1")).toEqual({ row: 1, col: 702 });
    });
  });

  describe("three-letter columns", () => {
    it("should convert AAA1 to { row: 1, col: 703 }", () => {
      expect(refToCoords("AAA1")).toEqual({ row: 1, col: 703 });
    });

    it("should convert ABC123 to { row: 123, col: 731 }", () => {
      expect(refToCoords("ABC123")).toEqual({ row: 123, col: 731 });
    });
  });

  describe("large row numbers", () => {
    it("should handle large row numbers", () => {
      expect(refToCoords("A1000000")).toEqual({ row: 1_000_000, col: 1 });
    });

    it("should handle Excel maximum row (1048576)", () => {
      expect(refToCoords("A1048576")).toEqual({ row: 1_048_576, col: 1 });
    });
  });

  describe("error cases", () => {
    it("should throw error for invalid format - no letters", () => {
      expect(() => refToCoords("123")).toThrow("Invalid cell reference: 123");
    });

    it("should throw error for invalid format - no numbers", () => {
      expect(() => refToCoords("ABC")).toThrow("Invalid cell reference: ABC");
    });

    it("should throw error for lowercase letters", () => {
      expect(() => refToCoords("a1")).toThrow("Invalid cell reference: a1");
    });

    it("should throw error for mixed case", () => {
      expect(() => refToCoords("Aa1")).toThrow("Invalid cell reference: Aa1");
    });

    it("should throw error for empty string", () => {
      expect(() => refToCoords("")).toThrow("Invalid cell reference: ");
    });

    it("should throw error for invalid characters", () => {
      expect(() => refToCoords("A1B")).toThrow("Invalid cell reference: A1B");
    });

    it("should throw error for zero row", () => {
      expect(() => refToCoords("A0")).toThrow("Invalid cell reference: A0");
    });

    it("should throw error for negative row", () => {
      expect(() => refToCoords("A-1")).toThrow("Invalid cell reference: A-1");
    });
  });
});

describe("coordsToRef", () => {
  describe("basic conversions", () => {
    it("should convert { row: 1, col: 1 } to A1", () => {
      expect(coordsToRef({ row: 1, col: 1 })).toEqual("A1");
    });

    it("should convert { row: 2, col: 2 } to B2", () => {
      expect(coordsToRef({ row: 2, col: 2 })).toEqual("B2");
    });

    it("should convert { row: 26, col: 26 } to Z26", () => {
      expect(coordsToRef({ row: 26, col: 26 })).toEqual("Z26");
    });
  });

  describe("multi-letter columns", () => {
    it("should convert { row: 1, col: 27 } to AA1", () => {
      expect(coordsToRef({ row: 1, col: 27 })).toEqual("AA1");
    });

    it("should convert { row: 1, col: 28 } to AB1", () => {
      expect(coordsToRef({ row: 1, col: 28 })).toEqual("AB1");
    });

    it("should convert { row: 1, col: 52 } to AZ1", () => {
      expect(coordsToRef({ row: 1, col: 52 })).toEqual("AZ1");
    });

    it("should convert { row: 1, col: 53 } to BA1", () => {
      expect(coordsToRef({ row: 1, col: 53 })).toEqual("BA1");
    });

    it("should convert { row: 1, col: 702 } to ZZ1", () => {
      expect(coordsToRef({ row: 1, col: 702 })).toEqual("ZZ1");
    });
  });

  describe("three-letter columns", () => {
    it("should convert { row: 1, col: 703 } to AAA1", () => {
      expect(coordsToRef({ row: 1, col: 703 })).toEqual("AAA1");
    });

    it("should convert { row: 123, col: 731 } to ABC123", () => {
      expect(coordsToRef({ row: 123, col: 731 })).toEqual("ABC123");
    });
  });

  describe("large numbers", () => {
    it("should handle large row numbers", () => {
      expect(coordsToRef({ row: 1_000_000, col: 1 })).toEqual("A1000000");
    });

    it("should handle Excel maximum row (1048576)", () => {
      expect(coordsToRef({ row: 1_048_576, col: 1 })).toEqual("A1048576");
    });

    it("should handle large column numbers", () => {
      expect(coordsToRef({ row: 1, col: 16_384 })).toEqual("XFD1"); // Excel max column
    });
  });

  describe("error cases", () => {
    it("should throw error for negative row", () => {
      expect(() => coordsToRef({ row: -1, col: 1 })).toThrow(
        "Row and column must be positive (1-based)"
      );
    });

    it("should throw error for negative column", () => {
      expect(() => coordsToRef({ row: 1, col: -1 })).toThrow(
        "Row and column must be positive (1-based)"
      );
    });

    it("should throw error for zero row", () => {
      expect(() => coordsToRef({ row: 0, col: 1 })).toThrow(
        "Row and column must be positive (1-based)"
      );
    });

    it("should throw error for zero column", () => {
      expect(() => coordsToRef({ row: 1, col: 0 })).toThrow(
        "Row and column must be positive (1-based)"
      );
    });
  });
});

describe("round-trip conversions", () => {
  describe("refToCoords -> coordsToRef", () => {
    it("should maintain consistency for A1", () => {
      const coords = refToCoords("A1");
      expect(coordsToRef(coords)).toEqual("A1");
    });

    it("should maintain consistency for ZZ999", () => {
      const coords = refToCoords("ZZ999");
      expect(coordsToRef(coords)).toEqual("ZZ999");
    });

    it("should maintain consistency for AAA1", () => {
      const coords = refToCoords("AAA1");
      expect(coordsToRef(coords)).toEqual("AAA1");
    });

    it("should maintain consistency for XFD1048576 (Excel maximum)", () => {
      const coords = refToCoords("XFD1048576");
      expect(coordsToRef(coords)).toEqual("XFD1048576");
    });
  });

  describe("coordsToRef -> refToCoords", () => {
    it("should maintain consistency for { row: 1, col: 1 }", () => {
      const ref = coordsToRef({ row: 1, col: 1 });
      expect(refToCoords(ref)).toEqual({ row: 1, col: 1 });
    });

    it("should maintain consistency for { row: 999, col: 702 }", () => {
      const ref = coordsToRef({ row: 999, col: 702 });
      expect(refToCoords(ref)).toEqual({ row: 999, col: 702 });
    });

    it("should maintain consistency for { row: 1, col: 703 }", () => {
      const ref = coordsToRef({ row: 1, col: 703 });
      expect(refToCoords(ref)).toEqual({ row: 1, col: 703 });
    });

    it("should maintain consistency for { row: 1048576, col: 16384 }", () => {
      const ref = coordsToRef({ row: 1_048_576, col: 16_384 });
      expect(refToCoords(ref)).toEqual({ row: 1_048_576, col: 16_384 });
    });
  });
});
