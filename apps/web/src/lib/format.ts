export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(minutes)}:${pad(rest)}`;
}

export function formatCompact(value: number): string {
  const rounded = Math.round(value);
  return rounded > 1000 ? `${(rounded / 1000).toFixed(1)}k` : `${rounded}`;
}
