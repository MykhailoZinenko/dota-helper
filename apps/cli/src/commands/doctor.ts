import type { CAC } from "cac";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import pc from "picocolors";
import { config } from "../lib/config.js";

type Check = { label: string; ok: boolean; hint?: string };

function checks(): Check[] {
  const python3 = spawnSync("python3", ["--version"]);
  const venvOk = existsSync(config.venvPython);
  const vpkImport = venvOk
    ? spawnSync(config.venvPython, ["-c", "import vpk"]).status === 0
    : false;
  return [
    { label: `Dota install: ${config.dotaPath}`, ok: existsSync(config.dotaPath), hint: "set DOTA_PATH" },
    { label: `VPK archive: ${config.vpkPath}`, ok: existsSync(config.vpkPath), hint: "install Dota 2 / verify files" },
    { label: "python3 available", ok: python3.status === 0, hint: "install Python 3" },
    { label: "venv present (.venv)", ok: venvOk, hint: "run `dota data extract` to bootstrap" },
    { label: "vpk module installed", ok: vpkImport, hint: "run `dota data extract` to bootstrap" },
  ];
}

export function registerDoctorCommand(cli: CAC): void {
  cli.command("doctor", "Verify the extraction toolchain").action(() => {
    let allOk = true;
    for (const check of checks()) {
      const mark = check.ok ? pc.green("✓") : pc.red("✗");
      const hint = check.ok ? "" : pc.dim(`  → ${check.hint}`);
      if (!check.ok) allOk = false;
      console.log(`${mark} ${check.label}${hint}`);
    }
    if (!allOk) process.exitCode = 1;
  });
}
