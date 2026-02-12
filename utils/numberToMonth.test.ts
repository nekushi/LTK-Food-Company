import { describe, it, expect } from "vitest";
import { getMonth } from "./numberToMonth";

describe("Test get month function", () => {
  it("if undefined, then return empty string", () => {
    expect(getMonth(undefined, "geo")).toBe("");
  });
  it("(GEO) if dateRange from read excel endpoints, then return month", () => {
    expect(getMonth("26.01.01～26.01.31", "geo")).toBe("January");
  });
  it("(PILA) if dateRange from read excel endpoints, then return month", () => {
    expect(getMonth("12.16.2025 ~ 01.01.2026", "pila")).toBe("December");
  });
});
