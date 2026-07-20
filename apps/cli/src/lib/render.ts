import Table from "cli-table3";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";

export type SummaryRow = { domain: string; records: number; delta: number; status: string };

export function formatDelta(delta: number): string {
  if (delta > 0) return pc.green(`+${delta}`);
  if (delta < 0) return pc.red(`${delta}`);
  return pc.dim("0");
}

export function summaryTable(rows: SummaryRow[]): string {
  const table = new Table({ head: ["domain", "records", "Δ", "status"] });
  for (const row of rows) {
    table.push([row.domain, String(row.records), formatDelta(row.delta), row.status]);
  }
  return table.toString();
}

export function createSpinner(text: string) {
  const spinner = yoctoSpinner({ text });
  return {
    start: () => spinner.start(),
    succeed: (msg: string) => spinner.success(msg),
    fail: (msg: string) => spinner.error(msg),
  };
}
