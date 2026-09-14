'use client';

import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { tokenStorage } from '@/lib/auth/token';
import type { Notification } from '@/types/notification';

// ─── WebSocket STOMP Client ───────────────────────────────────────
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/ws';

class WebSocketClient {
  private client: Client | null = null;
  private userId: string | null = null;

  connect(userId: string, onNotification: (n: Notification) => void): void {
    if (this.client?.connected) return;
    this.userId = userId;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${tokenStorage.getAccess() ?? ''}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WS] Connected');
        this.client!.subscribe(
          `/topic/notifications/${userId}`,
          (message: IMessage) => {
            try {
              const notification = JSON.parse(message.body) as Notification;
              onNotification(notification);
            } catch {
              console.warn('[WS] Could not parse notification', message.body);
            }
          },
        );
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error', frame);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.userId = null;
      console.log('[WS] Disconnected');
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export const wsClient = new WebSocketClient();
