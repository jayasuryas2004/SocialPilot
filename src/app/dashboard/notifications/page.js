"use client";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationList from "@/components/notifications/NotificationList";
import { 
  getWorkspaceStatus, 
  subscribeToWorkspaceStream, 
  markNotificationRead, 
  markAllNotificationsRead 
} from "@/lib/api/workspace";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial snapshot fetch
    getWorkspaceStatus()
      .then((data) => {
        if (isMounted) {
          const notifs = data?.notifications || [];
          if (Array.isArray(notifs)) {
            setNotifications(notifs);
          }
        }
      })
      .catch((err) => {
        console.warn("Notice: Initial workspace fetch failed:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // 2. Real-time Server-Sent Events (SSE) stream subscription
    const unsubscribeStream = subscribeToWorkspaceStream(
      (eventData) => {
        if (isMounted && eventData) {
          const notifs = eventData?.notifications;
          if (Array.isArray(notifs)) {
            setNotifications(notifs);
          }
        }
      },
      (err) => {
        // SSE error notice (handled gracefully by EventSource automatic retry)
      }
    );

    // 3. Local custom event listener for instant UI updates
    const handleUpdate = () => {
      getWorkspaceStatus().then((data) => {
        if (isMounted && data?.notifications) {
          setNotifications(data.notifications);
        }
      }).catch(() => {});
    };
    window.addEventListener("notifications_updated", handleUpdate);

    return () => {
      isMounted = false;
      if (typeof unsubscribeStream === "function") {
        unsubscribeStream();
      }
      window.removeEventListener("notifications_updated", handleUpdate);
    };
  }, []);

  // Filter logic
  const visibleNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.isRead);
    if (activeTab === "publishing") {
      return notifications.filter(n => n.category === "publishing" || n.category === "social" || n.type === "publishing");
    }
    if (activeTab === "system") {
      return notifications.filter(n => n.category === "system" || n.type === "system");
    }
    if (activeTab === "reports") {
      return notifications.filter(n => n.category === "reports" || n.type === "report");
    }
    return notifications.filter(n => n.category === activeTab);
  }, [notifications, activeTab]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      publishing: notifications.filter(n => n.category === "publishing" || n.category === "social" || n.type === "publishing").length,
      system: notifications.filter(n => n.category === "system" || n.type === "system").length,
      reports: notifications.filter(n => n.category === "reports" || n.type === "report").length,
    };
  }, [notifications]);

  // Actions
  const handleMarkAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error("Mark as read error:", err);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notifications_updated"));
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notifications_updated"));
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-200">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            System Notifications &amp; Activity
          </h1>
          <p className="text-base text-gray-500 dark:text-slate-400 mt-2">
            Real-time APScheduler publishing logs, OAuth sync alerts, and social performance updates.
          </p>
        </div>
        
        {counts.unread > 0 && (
          <Button 
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="border-violet-200 dark:border-purple-800 text-violet-700 dark:text-purple-300 hover:bg-violet-50 dark:hover:bg-purple-950/60 rounded-full px-6 py-5 font-bold text-sm shadow-sm transition-colors cursor-pointer"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          
          {/* TABS SECTION (FILTER) */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full block">
            <div className="px-4 md:px-6 pt-4 md:pt-6 border-b border-gray-100 dark:border-slate-800">
              <TabsList className="flex w-full justify-start gap-6 md:gap-8 rounded-none bg-transparent p-0 h-auto overflow-x-auto custom-scrollbar">
                {[
                  { value: "all", label: "All" },
                  { value: "unread", label: "Unread" },
                  { value: "publishing", label: "Publishing" },
                  { value: "system", label: "System Alerts" },
                  { value: "reports", label: "Reports" },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent px-1 pb-4 pt-2 font-extrabold text-sm md:text-base text-slate-500 dark:text-slate-400 shadow-none transition-none data-[state=active]:border-violet-800 data-[state=active]:dark:border-violet-400 data-[state=active]:text-violet-900 data-[state=active]:dark:text-violet-300 data-[state=active]:shadow-none hover:text-slate-800 dark:hover:text-slate-200 whitespace-nowrap cursor-pointer"
                  >
                    {tab.label} {counts[tab.value] > 0 && `(${counts[tab.value]})`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {/* NOTIFICATIONS SECTION (CONTENT) */}
          <div className="w-full">
            {loading ? (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium animate-pulse">
                Loading notifications...
              </div>
            ) : (
              <NotificationList 
                notifications={visibleNotifications} 
                onMarkAsRead={handleMarkAsRead} 
              />
            )}
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}