export function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}
