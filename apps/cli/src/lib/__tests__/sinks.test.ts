import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { diffRecords, localSink, dryRunSink, prodSink, getSink } from "../sinks.js";

describe("sinks", () => {
  it("diffRecords compares lengths", () => {
    expect(diffRecords(null, [1, 2])).toBe(2);
    expect(diffRecords([1], [1, 2, 3])).toBe(2);
  });

  it("localSink writes pretty JSON and reports delta", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sink-"));
    writeFileSync(join(dir, "items.json"), JSON.stringify([{ a: 1 }]));
    const result = await localSink(dir).write("items", [{ a: 1 }, { b: 2 }]);
    expect(result.path).toBe(join(dir, "items.json"));
    expect(result.delta).toBe(1);
    expect(JSON.parse(readFileSync(join(dir, "items.json"), "utf8"))).toHaveLength(2);
  });

  it("dryRunSink writes nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sink-"));
    const result = await dryRunSink(dir).write("items", [{ a: 1 }]);
    expect(result.path).toBeNull();
    expect(result.delta).toBe(1);
  });

  it("prodSink is unimplemented", async () => {
    await expect(prodSink().write("items", [])).rejects.toThrow("not implemented");
  });

  it("getSink routes targets", () => {
    expect(() => getSink("bogus", { dryRun: false })).toThrow("unknown target");
  });
});
