declare module 'sockjs-client' {
  class SockJS extends WebSocket {
    constructor(url: string, protocols?: string[], options?: unknown);
  }
  export default SockJS;
}
