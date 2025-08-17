"use client";

import type { Property } from "@/lib/types";
import { Trash2 } from "lucide-react";

export default function PropertyCard({
  p,
  onOpen,
  onRequestDelete, // ⬅️ new
}: {
  p: Property;
  onOpen: (p: Property) => void;
  onRequestDelete?: (p: Property) => void;
}) {
   return (
    <div className="group rounded-2xl overflow-hidden bg-white border shadow hover:shadow-lg transition relative">
      {/* Clickable area */}
      <button onClick={() => onOpen(p)} className="w-full text-left">
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

      {/* Trashcan */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRequestDelete?.(p);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-white shadow hover:bg-red-100 transition group/delete"
        aria-label="Delete property"
        title="Delete Property"
      >
        <Trash2 className="h-4 w-4 text-gray-500 group-hover/delete:text-red-600 transition" />
      </button>
    </div>
  );
}