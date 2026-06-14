export default function NaijaStocksLogo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-lg bg-accent text-white flex items-center justify-center font-bold"
      style={{ width: size, height: size }}
      aria-label="Basira"
      title="Basira"
    >
      B
    </div>
  );
}