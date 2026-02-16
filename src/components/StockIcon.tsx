function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function hslFromSymbol(symbol: string) {
  const h = hashString(symbol) % 360;
  // keep it not-too-light, not-too-dark
  return `hsl(${h} 60% 45%)`;
}

export default function StockIcon({
  symbol,
  size = 28,
}: {
  symbol: string;
  size?: number;
}) {
  const bg = hslFromSymbol(symbol);
  const initials = symbol.slice(0, 2).toUpperCase();

  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-semibold"
      style={{ width: size, height: size, background: bg }}
      aria-label={`${symbol} icon`}
      title={symbol}
    >
      <span style={{ fontSize: Math.max(10, Math.floor(size * 0.38)) }}>
        {initials}
      </span>
    </div>
  );
}
