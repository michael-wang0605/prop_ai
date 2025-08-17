"use client";

import { useState } from "react";
import Tabs from "@/components/Tabs";
import SectionCard from "@/components/SectionCard";
import TextHistory from "@/components/TextHistory";
import AIChat from "@/components/AIChat";
import RecentRequests from "@/components/RecentRequests";
import ImportantInfo from "@/components/ImportantInfo";
import type { Property } from "@/lib/types";

export default function PropertyDetail({ property }: { property: Property }) {
  const [tab, setTab] = useState("text");

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left column */}
      <div className="col-span-7 space-y-4">
        <section className="rounded-2xl overflow-hidden bg-white border shadow">
          <img
            src={property.photo ?? ""}
            alt={property.name ?? "Property photo"}
            className="w-full h-[220px] object-cover"
          />
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold">{property.name ?? "—"}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {property.context?.address ?? "—"}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-xl border cursor-pointer">Edit</button>
                <button className="px-3 py-1.5 rounded-xl border cursor-pointer">Share</button>
              </div>
            </div>

            <div className="mt-3">
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { key: "text", label: "Text History" },
                  { key: "ai", label: "AI Chat" },
                  { key: "req", label: "Recent Requests" },
                  { key: "info", label: "Important Info" },
                ]}
              />
            </div>
          </div>
        </section>

        {tab === "text" && <TextHistory phone={property.phone} />}
        {tab === "ai" && <AIChat context={property.context} />}
        {tab === "req" && <RecentRequests phone={property.phone} />}
        {tab === "info" && (
          <ImportantInfo context={property.context} phone={property.phone} />
        )}
      </div>

      {/* Right column */}
      <div className="col-span-5 space-y-4">
        <SectionCard title="Quick Actions">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button className="px-3 py-2 rounded-xl border cursor-pointer">New Request</button>
            <button className="px-3 py-2 rounded-xl border cursor-pointer">Send Text</button>
            <button className="px-3 py-2 rounded-xl border cursor-pointer">Schedule Visit</button>
            <button className="px-3 py-2 rounded-xl border cursor-pointer">Add Note</button>
          </div>
        </SectionCard>
        <SectionCard title="Highlights">
          <div className="text-sm grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold opacity-70">Open tickets</div>
              <div>—</div>
            </div>
            <div>
              <div className="text-xs font-semibold opacity-70">Last contact</div>
              <div>—</div>
            </div>
            <div>
              <div className="text-xs font-semibold opacity-70">Balance</div>
              <div>—</div>
            </div>
            <div>
              <div className="text-xs font-semibold opacity-70">Lease end</div>
              <div>—</div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
