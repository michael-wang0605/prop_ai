"use client";

import { useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import PropertyCard from "@/components/PropertyCard";
import SectionCard from "@/components/SectionCard";
import Tabs from "@/components/Tabs";
import TextHistory from "@/components/TextHistory";
import AIChat from "@/components/AIChat";
import RecentRequests from "@/components/RecentRequests";
import ImportantInfo from "@/components/ImportantInfo";

/* NEW */
import AddPropertyCard from "@/components/AddPropertyCard";
import Modal from "@/components/Modal";
import AddPropertyForm from "@/components/AddPropertyForm";

import { DEMO_PROPS } from "@/lib/demoData";
import type { Property } from "@/lib/types";

export default function Dashboard() {
  /* CHANGED: props -> state */
  const [props, setProps] = useState<Property[]>(DEMO_PROPS);
  const [selected, setSelected] = useState<Property | null>(null);
  const [tab, setTab] = useState("text");

  /* NEW: modal state */
  const [showAdd, setShowAdd] = useState(false);

  const detail = useMemo(
    () =>
      selected ? (
        <div className="grid grid-cols-12 gap-4">
          {/* ... keep your existing detail code unchanged ... */}
        </div>
      ) : null,
    [selected, tab]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="max-w-7xl mx-auto p-6">
        {!selected && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Properties</h2>
              {/* NEW: open Add Property modal */}
              <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-1.5 rounded-xl bg-black text-white text-sm cursor-pointer"
              >
                + Add Property
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AddPropertyCard onClick={() => setShowAdd(true)} />  {/* NEW */}
              {props.map((p) => (
                <PropertyCard key={p.id} p={p} onOpen={setSelected} />
              ))}
            </div>

            {/* NEW: modal + form */}
            <Modal open={showAdd} onClose={() => setShowAdd(false)}>
              <AddPropertyForm
                onCreate={(p) => {
                  setProps((prev) => [p, ...prev]);
                  setShowAdd(false);
                  // optional: open it immediately after creating
                  // setSelected(p);
                }}
              />
            </Modal>
          </>
        )}

        {selected && (
          <div className="space-y-4">
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              ← Back to properties
            </button>
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}
