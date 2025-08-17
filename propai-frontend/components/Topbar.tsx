export default function Topbar() {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6 bg-white border-b">
      <div className="text-xl font-semibold">PropAI Dashboard</div>
      <div className="flex items-center gap-3">
        <button className="text-sm px-3 py-1.5 rounded-xl border cursor-pointer">
          Help
        </button>
        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </div>
    </header>
  );
}
