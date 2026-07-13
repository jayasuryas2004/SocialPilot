"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationList from "@/components/notifications/NotificationList";

// Production Mock Data (Replace with your actual API/DB fetch later)
const INITIAL_NOTIFICATIONS = [
  { id: 1, type: "success", title: "Monthly Report Ready", message: "Your 'Summer Campaign' performance report has been successfully generated and is ready to download.", time: "10 mins ago", category: "reports", isRead: false },
  { id: 2, type: "message", title: "New Comment on LinkedIn", message: "Sarah Jenkins commented on your recent post: 'Great insights on the new algorithm!'", time: "1 hour ago", category: "social", isRead: false },
  { id: 3, type: "warning", title: "Post Failed to Publish", message: "Your scheduled X (Twitter) post failed due to an API error. Click to retry.", time: "3 hours ago", category: "system", isRead: true },
  { id: 4, type: "system", title: "Account Synced", message: "Your Instagram Business account was successfully re-authenticated.", time: "Yesterday", category: "system", isRead: true },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Filter logic
  const visibleNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.category === activeTab);
  }, [notifications, activeTab]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      reports: notifications.filter(n => n.category === "reports").length,
      social: notifications.filter(n => n.category === "social").length,
      system: notifications.filter(n => n.category === "system").length,
    };
  }, [notifications]);

  // Actions
  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-base text-gray-500 mt-2">
            Stay updated on your reports, scheduled posts, and account activity.
          </p>
        </div>
        
        {counts.unread > 0 && (
          <Button 
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="border-violet-200 text-violet-700 hover:bg-violet-50 rounded-full px-6 py-5 font-bold text-sm shadow-sm transition-colors"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          
          {/* TABS SECTION (FILTER) */}
          {/* Added 'block' to override any default flex-row behavior */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full block">
            <div className="px-4 md:px-6 pt-4 md:pt-6 border-b border-gray-100">
              <TabsList className="flex w-full justify-start gap-6 md:gap-8 rounded-none bg-transparent p-0 h-auto overflow-x-auto custom-scrollbar">
                {[
                  { value: "all", label: "All" },
                  { value: "unread", label: "Unread" },
                  { value: "reports", label: "Reports" },
                  { value: "social", label: "Social" },
                  { value: "system", label: "System" },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent px-1 pb-4 pt-2 font-extrabold text-sm md:text-base text-slate-500 shadow-none transition-none data-[state=active]:border-violet-800 data-[state=active]:text-violet-900 data-[state=active]:shadow-none hover:text-slate-800 whitespace-nowrap"
                  >
                    {tab.label} {counts[tab.value] > 0 && `(${counts[tab.value]})`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {/* NOTIFICATIONS SECTION (CONTENT) */}
          {/* Moved completely outside the Tabs wrapper to force it below the filter */}
          <div className="w-full">
            <NotificationList 
              notifications={visibleNotifications} 
              onMarkAsRead={handleMarkAsRead} 
            />
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}