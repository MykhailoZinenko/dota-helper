import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";

export type WriteResult = { path: string | null; delta: number; previous: number };

export interface Sink {
  write(domain: string, records: unknown[]): Promise<WriteResult>;
}

export function diffRecords(previous: unknown[] | null, next: unknown[]): number {
  return next.length - (previous?.length ?? 0);
}

function readPrevious(file: string): unknown[] | null {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function localSink(dataDir: string): Sink {
  return {
    async write(domain, records) {
      const file = join(dataDir, `${domain}.json`);
      const previous = readPrevious(file);
      writeFileSync(file, JSON.stringify(records, null, 2));
      return { path: file, delta: diffRecords(previous, records), previous: previous?.length ?? 0 };
    },
  };
}

export function dryRunSink(dataDir: string): Sink {
  return {
    async write(domain, records) {
      const file = join(dataDir, `${domain}.json`);
      const previous = readPrevious(file);
      return { path: null, delta: diffRecords(previous, records), previous: previous?.length ?? 0 };
    },
  };
}

export function prodSink(): Sink {
  return {
    async write() {
      throw new Error("prod target not implemented");
    },
  };
}

export function getSink(target: string, opts: { dryRun: boolean }): Sink {
  if (target === "local") {
    return opts.dryRun ? dryRunSink(config.dataDir) : localSink(config.dataDir);
  }
  if (target === "prod") return prodSink();
  throw new Error(`unknown target: ${target}`);
}
