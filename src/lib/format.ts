// src/lib/format.ts
export function formatNaira(value: number) {
  const n = Number(value ?? 0);
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}