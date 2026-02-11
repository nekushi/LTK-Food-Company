import { describe, it, expect } from "vitest";
// import { normalizeTime } from "./excelTImeFormat";
import { convertToTimeFormat } from "./excelTImeFormat";

describe("normalizeTime", () => {
  it("If null, returns ---", () => {
    expect(convertToTimeFormat(null)).toBe("---");
  });
  it("If long empty strings, returns ---", () => {
    expect(convertToTimeFormat("      ")).toBe("---");
  });
  it("If normal time format, returns value", () => {
    expect(convertToTimeFormat("12:34")).toBe("12:34");
  });
  it("If hour is single digit, add zero first before value", () => {
    expect(convertToTimeFormat("2:34")).toBe("02:34");
  });
  it("If weird long time format, convert then return", () => {
    const input = "0.3194444444444444";
    const expected = "07:40";

    expect(convertToTimeFormat(input)).toBe(expected);
  });
});
