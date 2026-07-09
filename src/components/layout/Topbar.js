export default function Topbar() {
  return (
    <div className="flex items-center justify-between bg-white border-b px-6 py-3">
      <input placeholder="Search..." className="border rounded-lg px-3 py-1.5 text-sm w-64" />
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold">JO</div>
        <div className="text-xs">
          <p className="font-semibold">James Okonkwo</p>
          <p className="text-gray-400">Content Creator</p>
        </div>
      </div>
    </div>
  );
}