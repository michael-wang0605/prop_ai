"use client";

import { clsx } from "@/lib/utils";

export default function Tabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { key: string; label: string }[];
}) {
  return (
    <div className="flex gap-2 border-b">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={clsx(
            "px-3 py-2 text-sm border-b-2 -mb-[2px] cursor-pointer",
            value === it.key
              ? "border-black font-medium"
              : "border-transparent text-gray-500 hover:text-black"
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
