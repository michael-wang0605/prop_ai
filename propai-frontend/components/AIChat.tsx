"use client";

import { useState } from "react";
import SectionCard from "@/components/SectionCard";
import { pretty } from "@/lib/utils";
import { classify } from "@/lib/api";
import type { ClassifyResult, Context } from "@/lib/types";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100">{children}</span>
  );
}

export default function AIChat({ context }: { context: Context }) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);

  async function run() {
    const msg = draft.trim();
    if (!msg) return;
    setLoading(true);
    try {
      setResult(await classify([msg], context));
      setDraft("");
    } catch (e: any) {
      alert(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard title="AI Chat">
      <div className="space-y-2">
        <textarea
          className="w-full border rounded-xl p-3 min-h-[90px]"
          placeholder="Type a tenant message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          onClick={run}
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-white ${
            loading ? "bg-gray-400" : "bg-black cursor-pointer"
          }`}
        >
          {loading ? "Thinking…" : "Ask AI"}
        </button>

        {result && (
          <div className="mt-2 text-sm space-y-1">
            <div className="flex gap-2 flex-wrap">
              <Pill>{result.category}</Pill>
              <Pill>priority: {result.priority}</Pill>
              <Pill>action: {result.action}</Pill>
              <Pill>conf: {result.confidence.toFixed(2)}</Pill>
            </div>
            <div>
              <div className="text-xs font-semibold opacity-70 mb-1">Draft Reply</div>
              <div className="border rounded-xl p-2 whitespace-pre-wrap">
                {result.reply}
              </div>
            </div>
            <details className="mt-1">
              <summary className="text-xs opacity-70 cursor-pointer">Entities</summary>
              <pre className="text-xs bg-gray-50 p-2 rounded-xl overflow-auto max-h-40">
                {pretty(result.entities)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
