"use client";

import { useEffect, useState } from "react";
import SectionCard from "@/components/SectionCard";
import { clsx, pretty } from "@/lib/utils";
import { getThread } from "@/lib/api";
import type { SmsMsg } from "@/lib/types";

export default function TextHistory({ phone }: { phone: string }) {
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<SmsMsg[]>([]);

  async function load() {
    setLoading(true);
    try {
      setMsgs(await getThread(phone));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (phone) load();
  }, [phone]);

  return (
    <SectionCard
      title="Text History"
      right={
        <button
          onClick={load}
          className="text-xs px-2 py-1 rounded border cursor-pointer"
        >
          Refresh
        </button>
      }
    >
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-auto">
          {msgs.length === 0 && (
            <div className="text-sm text-gray-500">No messages yet.</div>
          )}
          {msgs.map((m) => (
            <div
              key={m.sid}
              className={clsx(
                "p-3 rounded-xl border",
                m.direction === "inbound" ? "bg-gray-50" : "bg-gray-900 text-white"
              )}
            >
              <div className="text-[11px] opacity-70 mb-1">
                {m.direction} • {m.status}{" "}
                {m.category ? `• ${m.category} (${m.priority || "normal"})` : ""}
              </div>
              {m.body && <div className="text-sm whitespace-pre-wrap">{m.body}</div>}
              {m.ai_reply && (
                <div className="mt-1 text-xs italic opacity-80">
                  AI reply: {m.ai_reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
