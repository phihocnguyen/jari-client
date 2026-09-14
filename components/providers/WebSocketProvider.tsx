'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { wsClient } from '@/lib/websocket/client';
import { toast } from '@/components/ui/Toast';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (user?.id) {
      wsClient.connect(user.id, (notification) => {
        addNotification(notification);
        toast.info('New Notification', notification.message);
      });
    } else {
      wsClient.disconnect();
    }

    return () => {
      wsClient.disconnect();
    };
  }, [user?.id, addNotification]);

  return <>{children}</>;
}
