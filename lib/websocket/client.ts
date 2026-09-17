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
  private onNotification: ((n: Notification) => void) | null = null;

  connect(userId: string, onNotification: (n: Notification) => void): void {
    if (this.client && this.userId === userId) return; // already connecting/connected for this user
    if (this.client) this.client.deactivate();
    this.userId = userId;
    this.onNotification = onNotification;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 5000,
      // Read the token on every (re)connect so reconnects after a refresh use the latest token
      beforeConnect: () => {
        const token = tokenStorage.getAccess();
        if (this.client) {
          this.client.connectHeaders = {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          };
        }
      },
      onConnect: () => {
        console.log('[WS] Connected');
        this.client!.subscribe(
          `/topic/notifications/${userId}`,
          (message: IMessage) => {
            try {
              const notification = JSON.parse(message.body) as Notification;
              this.onNotification?.(notification);
            } catch {
              console.warn('[WS] Could not parse notification', message.body);
            }
          },
        );
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers['message'] ?? frame, frame.body || '');
      },
      onWebSocketClose: () => {
        console.log('[WS] Socket closed (will retry)');
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.userId = null;
      this.onNotification = null;
      console.log('[WS] Disconnected');
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

export const wsClient = new WebSocketClient();
