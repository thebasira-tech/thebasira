"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function EmailSignup({
  variant = "block",
}: {
  variant?: "block" | "compact";
}) {
  const pathname = usePathname();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = React.useState("");

  async function submit() {
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source: pathname }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Subscription failed");
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Subscription failed");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-center">
        <div className="text-sm font-medium text-text-primary">You're on the list! 🎉</div>
        <div className="text-xs text-text-muted mt-1">
          We'll keep you posted on Nigerian market insights and new Basira features.
        </div>
      </div>
    );
  }

  return (
    <div className={variant === "block" ? "rounded-xl border border-border bg-surface p-4" : ""}>
      {variant === "block" && (
        <>
          <h3 className="text-sm font-semibold text-text-primary">Stay in the loop</h3>
          <p className="text-xs text-text-muted mt-1 mb-3">
            Get Nigerian market insights and Basira updates. No spam.
          </p>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          onClick={submit}
          disabled={status === "sending"}
          className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap"
        >
          {status === "sending" ? "…" : "Subscribe"}
        </button>
      </div>

      {status === "error" && <div className="text-xs text-down mt-2">{error}</div>}
    </div>
  );
}