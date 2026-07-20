import { describe, it, expect } from "vitest";
import { formatDelta, summaryTable } from "../render.js";

function strip(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

describe("render", () => {
  it("formatDelta signs the number", () => {
    expect(strip(formatDelta(3))).toBe("+3");
    expect(strip(formatDelta(-2))).toBe("-2");
    expect(strip(formatDelta(0))).toBe("0");
  });

  it("summaryTable includes domain rows", () => {
    const out = strip(summaryTable([{ domain: "items", records: 594, delta: 0, status: "ok" }]));
    expect(out).toContain("items");
    expect(out).toContain("594");
  });
});
