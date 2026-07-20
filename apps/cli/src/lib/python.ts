import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config, SCRIPT_BY_DOMAIN, type Domain } from "./config.js";

export type ProgressEvent = { event: "progress"; done: number; total: number; label: string };
type Event = ProgressEvent | { event: "meta"; [k: string]: unknown };

export function runScript(
  python: string,
  scriptPath: string,
  env: Record<string, string>,
  onProgress?: (e: ProgressEvent) => void,
): Promise<{ records: unknown[]; meta: Record<string, unknown> }> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(python, [scriptPath], {
      env: { ...process.env, ...env },
    });
    let stdout = "";
    let stderrBuffer = "";
    let meta: Record<string, unknown> = {};

    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => {
      stderrBuffer += chunk;
      const lines = stderrBuffer.split("\n");
      stderrBuffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        let event: Event;
        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }
        if (event.event === "progress") onProgress?.(event);
        else if (event.event === "meta") meta = event;
      }
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`extractor exited ${code}: ${stderrBuffer}`));
        return;
      }
      try {
        resolvePromise({ records: JSON.parse(stdout), meta });
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function ensureVenv(): Promise<void> {
  if (existsSync(config.venvPython)) return Promise.resolve();
  return new Promise((resolvePromise, reject) => {
    const venvDir = join(config.cliRoot, ".venv");
    const create = spawn("python3", ["-m", "venv", venvDir], { stdio: "inherit" });
    create.on("error", reject);
    create.on("close", (code) => {
      if (code !== 0) return reject(new Error("venv creation failed"));
      const pip = spawn(
        config.venvPython.replace(/python$/, "pip"),
        ["install", "-q", "-r", join(config.extractorsDir, "requirements.txt")],
        { stdio: "inherit" },
      );
      pip.on("error", reject);
      pip.on("close", (c) => (c === 0 ? resolvePromise() : reject(new Error("pip install failed"))));
    });
  });
}

export async function runExtractor(
  domain: Domain,
  onProgress?: (e: ProgressEvent) => void,
): Promise<{ records: unknown[]; meta: Record<string, unknown> }> {
  await ensureVenv();
  const scriptPath = join(config.extractorsDir, SCRIPT_BY_DOMAIN[domain]);
  return runScript(config.venvPython, scriptPath, { DOTA_PATH: config.dotaPath }, onProgress);
}
