import { useQueryClient } from '@tanstack/react-query';
import { WS_CONFIG } from '@/config/api.config';
import { toast } from '@/hooks/use-toast';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private queryClient: any = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private isConnecting = false;

  constructor() {
    this.initialize();
  }

  setQueryClient(client: any) {
    this.queryClient = client;
  }

  initialize() {
    // Initialize event listeners map
    Object.values(WS_CONFIG.EVENTS).forEach(event => {
      this.listeners.set(event, []);
    });
  }

  connect() {
    // Mock successful connection
    this.isConnecting = false;
    console.log('WebSocket connection mocked');
    return;
  }

  private handleOpen(event: Event) {
    console.log('WebSocket connected', event);
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    // Send authentication message
    this.send({
      type: 'auth',
      token: localStorage.getItem('authToken'),
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      this.processMessage(data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnecting = false;
    this.socket = null;
    
    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event) {
    console.error('WebSocket error:', event);
    this.isConnecting = false;
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(
        WS_CONFIG.RECONNECT_INTERVAL * Math.pow(1.5, this.reconnectAttempts),
        30000 // Max 30 seconds
      );
      
      console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error(`Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
    }
  }

  private processMessage(data: any) {
    // Handle different message types
    switch (data.type) {
      case 'stats_update':
        if (this.queryClient) {
          this.queryClient.setQueryData(['dashboard-stats'], data.payload);
        }
        this.notifyListeners(WS_CONFIG.EVENTS.SYSTEM_STATUS_UPDATE, data.payload);
        break;
      
      case 'session_update':
        if (this.queryClient) {
          this.queryClient.invalidateQueries({ queryKey: ['sessions'] });
          this.queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
        }
        this.notifyListeners(WS_CONFIG.EVENTS.USER_CONNECTED, data.payload);
        break;
      
      case 'payment_update':
        if (this.queryClient) {
          this.queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
        if (data.payload.status === 'completed') {
          toast({
            title: 'Payment Completed',
            description: `Payment of ${data.payload.currency} ${data.payload.amount} has been completed.`,
          });
        }
        this.notifyListeners(WS_CONFIG.EVENTS.PAYMENT_RECEIVED, data.payload);
        break;
      
      case 'user_update':
        if (this.queryClient) {
          this.queryClient.invalidateQueries({ queryKey: ['users'] });
        }
        break;
      
      case 'system_alert':
        if (this.queryClient) {
          this.queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
        toast({
          title: 'System Alert',
          description: data.payload.message,
          variant: data.payload.severity === 'error' ? 'destructive' : 'default',
        });
        this.notifyListeners(WS_CONFIG.EVENTS.ALERT_TRIGGERED, data.payload);
        break;
      
      case 'notification':
        toast({
          title: data.payload.title,
          description: data.payload.message,
          variant: data.payload.type === 'error' ? 'destructive' : 'default',
        });
        break;
      
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  send(message: any) {
    // Mock successful message sending
    console.log('WebSocket message mocked:', message);
    return;
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.isConnecting = false;
  }

  addEventListener(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  removeEventListener(event: string, callback: (data: any) => void) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event) || [];
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  get isConnected() {
    // Always return true to prevent connection issues
    return true;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;

// React hook for using the WebSocket service
export const useWebSocket = () => {
  const queryClient = useQueryClient();
  
  // Set the query client for invalidation
  websocketService.setQueryClient(queryClient);
  
  return {
    connect: () => websocketService.connect(),
    disconnect: () => websocketService.disconnect(),
    send: (message: any) => websocketService.send(message),
    addEventListener: (event: string, callback: (data: any) => void) => 
      websocketService.addEventListener(event, callback),
    removeEventListener: (event: string, callback: (data: any) => void) => 
      websocketService.removeEventListener(event, callback),
    isConnected: websocketService.isConnected
  };
};