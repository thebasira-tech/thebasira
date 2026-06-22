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
import { useTheme } from "@/components/ThemeProvider";

type Props = {
  data: DailyBar[];
  height?: number;
};

function toLineSeriesData(data: DailyBar[]): LineData[] {
  return data.map((b) => ({ time: b.time, value: b.close }));
}

function toVolumeSeriesData(data: DailyBar[], upColor: string, downColor: string): HistogramData[] {
  return data.map((b) => ({
    time: b.time,
    value: b.volume,
    color: b.close >= b.open ? `${upColor}59` : `${downColor}59`, // ~35% alpha
  }));
}

function readThemeColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    background: v("--surface", "#15191E"),
    text: v("--text-muted", "#8B96A5"),
    grid: v("--border", "#23282E"),
    accent: v("--accent", "#00A878"),
    up: v("--up", "#16C784"),
    down: v("--down", "#EA3943"),
  };
}

export default function PriceChart({ data, height = 360 }: Props) {
  const { theme } = useTheme();
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

  // Create (or recreate) the chart on mount and whenever the theme changes.
  React.useEffect(() => {
    if (!containerRef.current) return;

    const colors = readThemeColors();

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: { borderColor: colors.grid },
      timeScale: { borderColor: colors.grid },
      crosshair: {
        vertLine: { color: colors.text },
        horzLine: { color: colors.text },
      },
    });

    const line = chart.addSeries(LineSeries, {
      color: colors.accent,
      lineWidth: 2,
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volume.priceScale().applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    line.priceScale().applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.25 },
    });

    line.setData(toLineSeriesData(data));
    volume.setData(toVolumeSeriesData(data, colors.up, colors.down));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, height]);

  // Update data on timeframe changes (without rebuilding the whole chart).
  React.useEffect(() => {
    if (!lineRef.current || !volRef.current || !chartRef.current) return;

    const colors = readThemeColors();
    lineRef.current.setData(toLineSeriesData(data));
    volRef.current.setData(toVolumeSeriesData(data, colors.up, colors.down));
    chartRef.current.timeScale().fitContent();
  }, [data]);

  const isUp = change ? change.diff >= 0 : true;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-sm font-medium text-text-primary">Price</div>
          <div className="text-xs text-text-muted">EOD series (simulated)</div>
        </div>

        {change && (
          <div
            className={`text-xs font-data font-medium ${isUp ? "text-up" : "text-down"}`}
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