"use client";

export default function AddPropertyCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded-2xl border-2 border-dashed bg-white h-[210px] hover:border-gray-400 hover:bg-gray-50 transition cursor-pointer"
      aria-label="Add Property"
    >
      <div className="text-center">
        <div className="text-3xl">＋</div>
        <div className="mt-2 font-medium">Add Property</div>
        <div className="text-xs text-gray-500">Create a new card</div>
      </div>
    </button>
  );
}
