"use client";

import { useRef, useState } from "react";

type Props = {
  symbol: string;
};

type Status = "idle" | "streaming" | "done" | "error";

export default function PriceMoveExplainer({ symbol }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  async function start() {
    if (status === "streaming") return;

    setStatus("streaming");
    setText("");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `/api/ai/explain-move?symbol=${encodeURIComponent(symbol)}`,
        {
          method: "GET",
          headers: { Accept: "text/event-stream" },
          cache: "no-store",
          signal: controller.signal,
        }
      );

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || `Request failed with status ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body returned from AI route.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sawDone = false;
      let sawDelta = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const lines = frame.split("\n");
          let eventName = "message";
          const dataLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
          }

          const rawData = dataLines.join("\n");
          if (!rawData) continue;

          let payload: any;
          try {
            payload = JSON.parse(rawData);
          } catch {
            throw new Error("Failed to parse SSE payload.");
          }

          if (eventName === "delta") {
            const delta = payload?.delta ?? "";
            if (delta) {
              sawDelta = true;
              setText((prev) => prev + delta);
            }
            continue;
          }

          if (eventName === "error") {
            throw new Error(payload?.message || "AI explainer failed.");
          }

          if (eventName === "done") {
            sawDone = true;
            setStatus("done");
            abortRef.current = null;
            return;
          }
        }
      }

      if (sawDone) {
        setStatus("done");
        return;
      }

      if (sawDelta) {
        setStatus("done");
        return;
      }

      throw new Error("No explanation content was returned.");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatus("idle");
        return;
      }

      setStatus("error");
      setError(err instanceof Error ? err.message : "AI explainer failed.");
    } finally {
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Why is {symbol} up/down today?
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            DB-grounded explanation from Basira prices + news mentions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === "streaming" ? (
            <button
              onClick={stop}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-2 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={start}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-background hover:bg-accent/90 transition-colors"
            >
              Explain
            </button>
          )}
        </div>
      </div>

      <div className="mt-3">
        {status === "idle" && (
          <div className="text-sm text-text-muted">
            Click <span className="font-medium text-text-primary">Explain</span> to generate a short driver summary.
          </div>
        )}

        {status === "error" && (
          <div className="text-sm text-down">
            {error || "AI explainer failed to load. Try again."}
          </div>
        )}

        {(status === "streaming" || status === "done") && (
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-surface-2 border border-border p-3 text-sm text-text-primary">
            {text || "Generating explanation…"}
          </pre>
        )}
      </div>

      <div className="mt-3 text-xs text-text-muted">
        Not investment advice. Output may include labeled inference when the DB lacks definitive drivers.
      </div>
    </section>
  );
}