import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

@Injectable()
export class WebsocketService {
  constructor(private readonly websocketGateway: WebsocketGateway) {}

  // Broadcast to all authenticated clients
  broadcastToAll(event: string, data: any): void {
    this.websocketGateway.broadcastToAuthenticated({
      type: event,
      payload: data,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to specific user
  broadcastToUser(userId: string, event: string, data: any): void {
    this.websocketGateway.broadcastToUser(userId, {
      type: event,
      payload: data,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast system alert
  broadcastAlert(title: string, message: string, severity: 'info' | 'warning' | 'error' | 'critical'): void {
    this.websocketGateway.broadcastToAuthenticated({
      type: 'system_alert',
      payload: {
        title,
        message,
        severity,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Broadcast dashboard stats update
  broadcastStatsUpdate(stats: any): void {
    this.websocketGateway.broadcastToAuthenticated({
      type: 'stats_update',
      payload: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Broadcast session update
  broadcastSessionUpdate(sessionData: any): void {
    this.websocketGateway.broadcastToAuthenticated({
      type: 'session_update',
      payload: sessionData,
    });
  }

  // Broadcast payment update
  broadcastPaymentUpdate(paymentData: any): void {
    this.websocketGateway.broadcastToAuthenticated({
      type: 'payment_update',
      payload: paymentData,
    });
    
    // Also send to specific user if userId is provided
    if (paymentData.userId) {
      this.websocketGateway.broadcastToUser(paymentData.userId, {
        type: 'payment_update',
        payload: paymentData,
      });
    }
  }

  // Broadcast user update
  broadcastUserUpdate(userData: any): void {
    this.websocketGateway.broadcastToAuthenticated({
      type: 'user_update',
      payload: userData,
    });
  }

  // Broadcast notification to specific user
  sendNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
    this.websocketGateway.broadcastToUser(userId, {
      type: 'notification',
      payload: {
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
      },
    });
  }
}