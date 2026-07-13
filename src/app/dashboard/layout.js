import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }) {
  // We are not using a database, so we pass a static number
  const unreadCount = 4; 

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <Sidebar unreadCount={unreadCount} />
      <div className="flex-1">
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
}