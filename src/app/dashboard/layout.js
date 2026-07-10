// src/app/dashboard/layout.js
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar"; // Make sure this matches your file name
// Note: If your file is named Topbar.jsx, you might need to import it as Topbar

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <Sidebar />
      <div className="flex-1">
        <Topbar /> {/* This must match the name you imported above */}
        <main>{children}</main>
      </div>
    </div>
  );
}