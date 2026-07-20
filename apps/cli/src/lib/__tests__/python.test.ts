import { describe, it, expect } from "vitest";
import { writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runScript } from "../python.js";

describe("runScript", () => {
  it("splits stdout JSON from stderr progress events", async () => {
    const dir = mkdtempSync(join(tmpdir(), "dota-"));
    const script = join(dir, "fake.py");
    writeFileSync(
      script,
      [
        "import sys, json",
        'print(json.dumps({"event":"progress","done":1,"total":2,"label":"a"}), file=sys.stderr)',
        'print(json.dumps({"event":"meta","domain":"x","records":1}), file=sys.stderr)',
        'json.dump([{"k":1}], sys.stdout)',
      ].join("\n"),
    );
    const events: unknown[] = [];
    const result = await runScript("python3", script, {}, (e) => events.push(e));
    expect(result.records).toEqual([{ k: 1 }]);
    expect(result.meta).toMatchObject({ domain: "x", records: 1 });
    expect(events).toContainEqual({ event: "progress", done: 1, total: 2, label: "a" });
  });
});
