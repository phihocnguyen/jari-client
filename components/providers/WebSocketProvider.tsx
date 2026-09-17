'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { wsClient } from '@/lib/websocket/client';
import { notificationApi } from '@/lib/api/notification';
import { notificationTitle } from '@/utils/notification';
import { toast } from '@/components/ui/Toast';

const isMockMode = () => process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const user             = useAuthStore((s) => s.user);
  const addNotification  = useNotificationStore((s) => s.addNotification);
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  useEffect(() => {
    if (!user?.id || isMockMode()) {
      wsClient.disconnect();
      return;
    }

    let cancelled = false;

    // Load persisted notification history so the bell survives reloads
    notificationApi.list()
      .then((res) => { if (!cancelled && res.data) setNotifications(res.data); })
      .catch(() => { /* live pushes still work even if history fetch fails */ });

    wsClient.connect(user.id, (notification) => {
      addNotification(notification);
      toast.info(notificationTitle(notification.type), notification.message);
    });

    return () => {
      cancelled = true;
      wsClient.disconnect();
    };
  }, [user?.id, addNotification, setNotifications]);

  return <>{children}</>;
}
