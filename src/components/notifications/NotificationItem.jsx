import { cn } from "@/lib/utils";
import { Check, Info, AlertTriangle, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap = {
  success: { icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-300" },
  warning: { icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-950/60", text: "text-amber-700 dark:text-amber-300" },
  message: { icon: MessageSquare, bg: "bg-blue-100 dark:bg-blue-950/60", text: "text-blue-700 dark:text-blue-300" },
  system: { icon: Info, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300" },
};

export default function NotificationItem({ notification, onMarkAsRead }) {
  const { type, title, message, time, isRead } = notification;
  const { icon: Icon, bg, text } = iconMap[type] || iconMap.system;

  return (
    <div 
      className={cn(
        "group flex items-start gap-4 p-4 md:p-5 border-b border-gray-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
        !isRead ? "bg-violet-50/30 dark:bg-purple-950/20" : "bg-white dark:bg-slate-900"
      )}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", bg, text)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
            {title}
          </p>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 whitespace-nowrap">
            {time}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
          {message}
        </p>
      </div>

      {/* Unread Indicator & Hover Actions */}
      <div className="flex-shrink-0 flex flex-col items-end justify-center w-auto pt-1 gap-2">
        {!isRead && (
          <>
            <div className="w-2.5 h-2.5 rounded-full bg-[#F97316] mb-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onMarkAsRead(notification.id)}
              className="text-violet-700 dark:text-purple-300 hover:text-violet-900 dark:hover:text-purple-100 hover:bg-violet-100 dark:hover:bg-slate-800 font-bold text-xs px-2 h-8 cursor-pointer"
            >
              Mark as read
            </Button>
          </>
        )}
      </div>
    </div>
  );
}