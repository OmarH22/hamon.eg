/**
 * CSV export helper.
 *
 * Emits a UTF-8 BOM so Excel renders Arabic correctly, and neutralises leading
 * characters that spreadsheet apps would otherwise execute as formulas.
 */

const RISKY_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (RISKY_PREFIX.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) lines.push(row.map(escapeCell).join(','));
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
