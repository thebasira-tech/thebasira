"use client";

import React from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type HistogramData,
} from "lightweight-charts";
import type { DailyBar } from "@/lib/history";

type Props = {
  data: DailyBar[];
  height?: number;
};

function toLineSeriesData(data: DailyBar[]): LineData[] {
  return data.map((b) => ({ time: b.time, value: b.close }));
}

function toVolumeSeriesData(data: DailyBar[]): HistogramData[] {
  return data.map((b) => ({
    time: b.time,
    value: b.volume,
    // subtle color; you can change later
    color: b.close >= b.open ? "rgba(22, 163, 74, 0.35)" : "rgba(220, 38, 38, 0.35)",
  }));
}

export default function PriceChart({ data, height = 360 }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);

  const lineRef = React.useRef<ISeriesApi<"Line"> | null>(null);
  const volRef = React.useRef<ISeriesApi<"Histogram"> | null>(null);

  // Tiny last-day change label
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const change = React.useMemo(() => {
    if (!last || !prev) return null;
    const diff = last.close - prev.close;
    const pct = prev.close === 0 ? 0 : (diff / prev.close) * 100;
    return { diff, pct };
  }, [last?.close, prev?.close]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "white" },
        textColor: "#111827",
      },
      grid: {
        vertLines: { color: "#F3F4F6" },
        horzLines: { color: "#F3F4F6" },
      },
      rightPriceScale: { borderColor: "#E5E7EB" },
      timeScale: { borderColor: "#E5E7EB" },
      crosshair: {
        vertLine: { color: "#9CA3AF" },
        horzLine: { color: "#9CA3AF" },
      },
    });

    // ✅ Price line (top area)
    const line = chart.addSeries(LineSeries, {
      color: "#16A34A",
      lineWidth: 2,
    });

    // ✅ Volume bars (bottom area)
    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "", // separate (hidden) scale
      // Put volume bars at the bottom quarter-ish of chart
      scaleMargins: { top: 0.75, bottom: 0.0 },
    });

    // Give the price series more room above volume
    line.priceScale().applyOptions({
      scaleMargins: { top: 0.10, bottom: 0.25 },
    });

    line.setData(toLineSeriesData(data));
    volume.setData(toVolumeSeriesData(data));

    chart.timeScale().fitContent();
    chart.applyOptions({ width: containerRef.current.clientWidth });

    const handleResize = () => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    chartRef.current = chart;
    lineRef.current = line;
    volRef.current = volume;

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      lineRef.current = null;
      volRef.current = null;
    };
  }, []); // mount once

  // Update data on timeframe changes
  React.useEffect(() => {
    if (!lineRef.current || !volRef.current || !chartRef.current) return;

    lineRef.current.setData(toLineSeriesData(data));
    volRef.current.setData(toVolumeSeriesData(data));
    chartRef.current.timeScale().fitContent();
  }, [data]);

  const isUp = change ? change.diff >= 0 : true;

  return (
    <div className="border rounded-xl bg-white p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-sm font-medium text-gray-900">Price</div>
          <div className="text-xs text-gray-500">EOD series (simulated)</div>
        </div>

        {change && (
          <div
            className={`text-xs font-medium ${
              isUp ? "text-green-600" : "text-red-600"
            }`}
            title="Change vs previous close"
          >
            {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
            {change.pct.toFixed(2)}%
          </div>
        )}
      </div>

      <div ref={containerRef} />
    </div>
  );
}