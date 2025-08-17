"use client";

import type { Property } from "@/lib/types";

export default function PropertyCard({
  p,
  onOpen,
}: {
  p: Property;
  onOpen: (p: Property) => void;
}) {
  return (
    <button
      onClick={() => { console.log("OPEN", p); onOpen(p); }}
      className="group rounded-2xl overflow-hidden bg-white border shadow hover:shadow-lg transition cursor-pointer"
    >
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img
          src={p.photo}
          alt={p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>
      <div className="p-3">
        <div className="font-semibold line-clamp-1">{p.name}</div>
        <div className="text-xs text-gray-500 mt-1">{p.context.address}</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <span className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 cursor-pointer">
            Text History
          </span>
          <span className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 cursor-pointer">
            AI Chat
          </span>
          <span className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 cursor-pointer">
            Requests
          </span>
        </div>
      </div>
    </button>
  );
}

