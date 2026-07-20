import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const cliRoot = resolve(here, "..", "..");

const dotaPath =
  process.env.DOTA_PATH ??
  join(homedir(), "Library", "Application Support", "Steam", "steamapps", "common", "dota 2 beta");

export const config = {
  cliRoot,
  extractorsDir: join(cliRoot, "extractors"),
  venvPython: join(cliRoot, ".venv", "bin", "python"),
  dataDir: resolve(cliRoot, "..", "api", "src", "data"),
  dotaPath,
  vpkPath: join(dotaPath, "game", "dota", "pak01_dir.vpk"),
};

export const DOMAINS = ["items", "neutral-items", "abilities", "heroes"] as const;
export type Domain = (typeof DOMAINS)[number];

export const SCRIPT_BY_DOMAIN: Record<Domain, string> = {
  items: "items.py",
  "neutral-items": "neutral.py",
  abilities: "abilities.py",
  heroes: "heroes.py",
};
