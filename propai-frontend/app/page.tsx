"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetail from "@/components/PropertyDetail";
import AddPropertyCard from "@/components/AddPropertyCard";
import Modal from "@/components/Modal";
import AddPropertyForm from "@/components/AddPropertyForm";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { DEMO_PROPS } from "@/lib/demoData";
import type { Property } from "@/lib/types";

export default function Dashboard() {
  const [props, setProps] = useState<Property[]>(DEMO_PROPS);
  const [selected, setSelected] = useState<Property | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);

  const handleCreate = (p: Property) => {
    setProps((prev) => [p, ...prev]);
    setShowAdd(false);
    // Optional: open the new property immediately
    // setSelected(p);
  };

  const confirmDelete = async (p: Property) => {
    setProps((prev) => prev.filter((x) => x.id !== p.id));
    if (selected?.id === p.id) setSelected(null); // ⬅️ Ensure navigation back to property list
    setPendingDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />

      <div className="max-w-7xl mx-auto p-6">
        {!selected && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Properties</h2>
              <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-1.5 rounded-xl bg-black text-white text-sm cursor-pointer"
              >
                + Add Property
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AddPropertyCard onClick={() => setShowAdd(true)} />
              {props.map((p) => (
                <PropertyCard
                  key={p.id}
                  p={p}
                  onOpen={setSelected}
                  onRequestDelete={setPendingDelete}
                />
              ))}
            </div>

            <Modal open={showAdd} onClose={() => setShowAdd(false)}>
              <AddPropertyForm onCreate={handleCreate} />
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

            <PropertyDetail
              property={selected}
              onRequestDelete={setPendingDelete} // ⬅️ Trigger modal in page.tsx
            />
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        property={pendingDelete}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
