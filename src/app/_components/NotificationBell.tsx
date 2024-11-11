import { useState } from "react";
import { Bell, Calendar, CheckCircle, PlusCircle } from "lucide-react";
import { api } from "techme/trpc/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "t/components/ui/popover";
import { Button } from "t/components/ui/button";
import { NotificationType } from "techme/server/db/schema";


function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.MEETING_SCHEDULED:
      return <Calendar className="h-4 w-4" />;
    case NotificationType.DOCUMENT_VALIDATED:
      return <CheckCircle className="h-4 w-4" />;
    case NotificationType.PROJECT_ADDED:
      return <PlusCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications } = api.notifications.getAll.useQuery();
  const { mutate: markAsRead } = api.notifications.markAsRead.useMutation();
  const utils = api.useUtils();

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const handleMarkAsRead = async (id: number) => {
    void markAsRead({ id });
    void utils.notifications.getAll.invalidate();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[400px] overflow-y-auto">
  <div className="space-y-2">
    {notifications?.map((notification) => (
      <div
        key={notification.id}
        className={`p-3 rounded-lg border ${
          notification.isRead ? "bg-gray-50" : "bg-white"
        }`}
        onClick={() => handleMarkAsRead(notification.id)}
      >
        <div className="flex items-start gap-3">
          {getNotificationIcon(notification.type as NotificationType)}
          <div className="flex-1">
            <h4 className="font-semibold">{notification.title}</h4>
            <p className="text-sm text-gray-600">{notification.message}</p>
            <span className="text-xs text-gray-400">
              {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Unknown"}
            </span>
          </div>
        </div>
      </div>
    ))}
    {!notifications?.length && (
      <p className="text-center text-gray-500">No notifications</p>
    )}
  </div>
</PopoverContent>
    </Popover>
  );
}