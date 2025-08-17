"use client";

import { useEffect, useState } from "react";
import SectionCard from "@/components/SectionCard";
import { getThread } from "@/lib/api";
import type { SmsMsg } from "@/lib/types";

export default function RecentRequests({ phone }: { phone: string }) {
  const [reqs, setReqs] = useState<SmsMsg[]>([]);

  async function load() {
    const all = await getThread(phone);
    const withCls = all.filter((m) => m.category);
    setReqs(
      withCls.sort((a, b) => (a.created_at > b.created_at ? -1 : 1)).slice(0, 8)
    );
  }
  useEffect(() => {
    if (phone) load();
  }, [phone]);

  return (
    <SectionCard
      title="Recent Requests"
      right={
        <button
          onClick={load}
          className="text-xs px-2 py-1 rounded border cursor-pointer"
        >
          Refresh
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-2 max-h-80 overflow-auto">
        {reqs.length === 0 && (
          <div className="text-sm text-gray-500">Nothing yet.</div>
        )}
        {reqs.map((r) => (
          <div key={r.sid} className="p-3 rounded-xl border bg-white">
            <div className="text-[11px] opacity-70 mb-1">
              {r.category} • {r.priority || "normal"}
            </div>
            <div className="text-sm line-clamp-2">{r.body || "(no text)"}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
