import NotificationItem from "./NotificationItem";
import EmptyState from "@/components/common/EmptyState";

export default function NotificationList({ notifications, onMarkAsRead }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="py-12">
        <EmptyState 
          title="You're all caught up!" 
          description="You don't have any new notifications right now." 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {notifications.map((notif) => (
        <NotificationItem 
          key={notif.id} 
          notification={notif} 
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}