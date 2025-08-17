"use client";

import { useState } from "react";
import type { Property } from "@/lib/types";

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop";

export default function AddPropertyForm({
  onCreate,
}: {
  onCreate: (p: Property) => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      alert("Name and address are required.");
      return;
    }
    const id = `prop-${Date.now()}`;
    const newProp: Property = {
      id,
      name: name.trim(),
      photo: photo.trim() || DEFAULT_PHOTO,
      phone: phone.trim() || "+10000000000",
      context: {
        tenant_name: "—",
        unit: "—",
        address: address.trim(),
        hotline: "+1-555-0100",
        portal_url: "https://portal.example.com/login",
        property_name: name.trim(),
      },
    };
    onCreate(newProp);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h3 className="text-lg font-semibold">Add Property</h3>

      <label className="text-sm block">
        <div className="mb-1 font-medium">Name *</div>
        <input
          className="w-full border rounded-xl p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Maple Court — Unit 3A"
          required
        />
      </label>

      <label className="text-sm block">
        <div className="mb-1 font-medium">Address *</div>
        <input
          className="w-full border rounded-xl p-2"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Maple St, Atlanta, GA"
          required
        />
      </label>

      <label className="text-sm block">
        <div className="mb-1 font-medium">Phone</div>
        <input
          className="w-full border rounded-xl p-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 404 555 0123"
        />
      </label>

      <label className="text-sm block">
        <div className="mb-1 font-medium">Photo URL</div>
        <input
          className="w-full border rounded-xl p-2"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          placeholder="https://…"
        />
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            setName("");
            setAddress("");
            setPhone("");
            setPhoto("");
          }}
          className="px-3 py-2 rounded-xl border cursor-pointer"
        >
          Clear
        </button>
        <button type="submit" className="px-4 py-2 rounded-xl bg-black text-white cursor-pointer">
          Create
        </button>
      </div>
    </form>
  );
}
