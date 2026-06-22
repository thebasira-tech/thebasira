"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [reason, setReason] = React.useState("");
  const [suggestion, setSuggestion] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "done" | "error">("idle");

  function reset() {
    setRating(0);
    setHover(0);
    setReason("");
    setSuggestion("");
    setStatus("idle");
  }

  async function submit() {
    if (rating < 1) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname, rating, reason, suggestion }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-accent text-white px-4 py-3 shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Give feedback"
      >
        {open ? <X size={18} /> : <MessageSquare size={18} />}
        <span className="text-sm font-medium hidden sm:inline">
          {open ? "Close" : "Feedback"}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-80 rounded-xl border border-border bg-surface shadow-2xl p-4">
          {status === "done" ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🙏</div>
              <div className="text-sm font-medium text-text-primary">Thanks for the feedback!</div>
              <button
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="mt-3 text-xs text-accent hover:underline"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                How is this page?
              </h3>
              <p className="text-xs text-text-muted mb-3">
                Your rating helps us improve Basira. No email needed.
              </p>

              {/* Star rating */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="text-2xl leading-none transition-transform hover:scale-110"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    <span className={(hover || rating) >= n ? "text-yellow-400" : "text-text-muted/40"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What's the reason for your rating?"
                rows={2}
                className="w-full mb-2 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />

              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Any suggestions for improvement?"
                rows={2}
                className="w-full mb-3 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />

              {status === "error" && (
                <div className="text-xs text-down mb-2">
                  Something went wrong. Please try again.
                </div>
              )}

              <button
                onClick={submit}
                disabled={rating < 1 || status === "sending"}
                className="w-full rounded-lg bg-accent text-white px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending…" : "Submit feedback"}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}