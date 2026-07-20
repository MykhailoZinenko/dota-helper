import type { CAC } from "cac";
import pc from "picocolors";
import { DOMAINS, type Domain } from "../lib/config.js";
import { runExtractor } from "../lib/python.js";
import { getSink } from "../lib/sinks.js";
import { createSpinner, summaryTable, type SummaryRow } from "../lib/render.js";

export function registerDataCommand(cli: CAC): void {
  cli
    .command("data <action> [...domains]", "Static data ops (action: extract)")
    .option("--target <name>", "Where to write the data", { default: "local" })
    .option("--dry-run", "Extract without writing")
    .action(async (action: string, domains: string[], options: { target: string; dryRun?: boolean }) => {
      if (action !== "extract") {
        console.error(pc.red(`unknown action: ${action} (expected "extract")`));
        process.exitCode = 1;
        return;
      }
      const selected: Domain[] = domains.length
        ? (domains as Domain[])
        : [...DOMAINS];
      const invalid = selected.filter((d) => !DOMAINS.includes(d));
      if (invalid.length) {
        console.error(pc.red(`unknown domain(s): ${invalid.join(", ")}`));
        process.exitCode = 1;
        return;
      }

      let sink;
      try {
        sink = getSink(options.target, { dryRun: Boolean(options.dryRun) });
      } catch (err) {
        console.error(pc.red((err as Error).message));
        process.exitCode = 1;
        return;
      }
      const rows: SummaryRow[] = [];

      for (const domain of selected) {
        const spinner = createSpinner(`extracting ${domain}`);
        spinner.start();
        try {
          const { records } = await runExtractor(domain, (e) => {
            spinner.start();
          });
          const result = await sink.write(domain, records);
          spinner.succeed(`${domain} (${records.length})`);
          rows.push({
            domain,
            records: records.length,
            delta: result.delta,
            status: options.dryRun ? "dry-run" : "written",
          });
        } catch (err) {
          spinner.fail(`${domain}: ${(err as Error).message}`);
          rows.push({ domain, records: 0, delta: 0, status: pc.red("failed") });
        }
      }

      console.log("\n" + summaryTable(rows));
    });
}
