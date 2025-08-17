"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { Property } from "@/lib/types";

export default function ConfirmDeleteModal({
  property,
  onConfirm,
  onCancel,
}: {
  property: Property | null;
  onConfirm: (p: Property) => void;
  onCancel: () => void;
}) {
  const [ack, setAck] = useState(false);

  // Reset the acknowledgment whenever a new property is selected for deletion.
  useEffect(() => {
    if (property) setAck(false);
  }, [property?.id]);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!property) return null;

  const handleCancel = () => {
    setAck(false);    // safety reset in case the component stays mounted
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
        aria-hidden="true"
      />
      <div className="relative z-[101] w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-base font-semibold">Delete property</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-700">
            You’re about to permanently delete <span className="font-medium">{property.name}</span>.
          </p>
          <p className="text-sm text-gray-700">
            This cannot be undone. If you later add a new property at the same address, the AI will need to text the tenant again to obtain message opt-in.
          </p>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>
              I understand this will permanently remove this property and its card, and re-adding the same address will trigger a new tenant opt-in request.
            </span>
          </label>
        </div>

        <div className="p-4 pt-0 flex items-center justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-xl bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={!ack}
            onClick={() => onConfirm(property)}
            className={`px-3 py-1.5 rounded-xl text-sm text-white transition ${
              ack ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"
            }`}
          >
            Delete forever
          </button>
        </div>
      </div>
    </div>
  );
}
