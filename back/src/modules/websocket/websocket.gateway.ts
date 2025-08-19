import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsResponse,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Define a custom interface that extends WebSocket but with our additional properties
interface AuthenticatedClient extends Omit<WebSocket, 'readyState'> {
  userId?: string;
  isAuthenticated?: boolean;
  clientId?: string;
  lastActivity?: Date;
  readyState: 0 | 1 | 2 | 3; // Use the correct type for readyState
}

@WebSocketGateway({
  path: '/api/ws',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('WebsocketGateway');
  private clients: Map<string, AuthenticatedClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    
    // Set up heartbeat interval to check for stale connections
    this.heartbeatInterval = setInterval(() => {
      this.checkConnections();
    }, 30000); // Check every 30 seconds
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    const clientId = this.generateClientId();
    const authenticatedClient = client as AuthenticatedClient;
    
    authenticatedClient.clientId = clientId;
    authenticatedClient.isAuthenticated = false;
    authenticatedClient.lastActivity = new Date();
    
    this.clients.set(clientId, authenticatedClient);
    this.logger.log(`Client connected: ${clientId}`);
    
    // Send welcome message
    this.sendToClient(authenticatedClient, {
      event: 'connection',
      data: {
        clientId,
        message: 'Connected to WebSocket server',
        authenticated: false,
      },
    });
  }

  handleDisconnect(client: WebSocket) {
    const authenticatedClient = client as AuthenticatedClient;
    const clientId = authenticatedClient.clientId;
    
    if (clientId) {
      this.clients.delete(clientId);
      this.logger.log(`Client disconnected: ${clientId}`);
    }
  }

  @SubscribeMessage('auth')
  handleAuth(client: WebSocket, payload: any): WsResponse<any> {
    const authenticatedClient = client as AuthenticatedClient;
    authenticatedClient.lastActivity = new Date();
    
    try {
      // Verify JWT token
      const token = payload.token;
      if (!token) {
        return {
          event: 'auth',
          data: {
            success: false,
            message: 'No token provided',
          },
        };
      }
      
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      authenticatedClient.userId = decoded.sub;
      authenticatedClient.isAuthenticated = true;
      
      this.logger.log(`Client authenticated: ${authenticatedClient.clientId} (User: ${decoded.sub})`);
      
      return {
        event: 'auth',
        data: {
          success: true,
          message: 'Authentication successful',
          userId: decoded.sub,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
      this.logger.error(`Authentication error: ${errorMessage}`);
      
      return {
        event: 'auth',
        data: {
          success: false,
          message: 'Authentication failed',
          error: errorMessage,
        },
      };
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: WebSocket): WsResponse<any> {
    const authenticatedClient = client as AuthenticatedClient;
    authenticatedClient.lastActivity = new Date();
    
    return {
      event: 'pong',
      data: {
        timestamp: new Date().toISOString(),
        clientId: authenticatedClient.clientId,
      },
    };
  }

  @SubscribeMessage('request_data')
  handleRequestData(client: WebSocket, payload: any): WsResponse<any> {
    const authenticatedClient = client as AuthenticatedClient;
    authenticatedClient.lastActivity = new Date();
    
    // Check if client is authenticated
    if (!authenticatedClient.isAuthenticated) {
      return {
        event: 'error',
        data: {
          message: 'Authentication required',
        },
      };
    }
    
    // Process the data request
    const { type, params } = payload;
    
    // This is a placeholder - in a real application, you would fetch actual data
    return {
      event: 'data_response',
      data: {
        type,
        timestamp: new Date().toISOString(),
        data: {
          message: `Data request processed for type: ${type}`,
          params,
        },
      },
    };
  }

  // Send a message to a specific client
  sendToClient(client: AuthenticatedClient, message: any): void {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(message));
    }
  }

  // Send a message to all authenticated clients
  broadcastToAuthenticated(message: any): void {
    this.clients.forEach((client) => {
      if (client.isAuthenticated && client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Send a message to a specific user (can be connected with multiple clients)
  broadcastToUser(userId: string, message: any): void {
    this.clients.forEach((client) => {
      if (client.userId === userId && client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Check for stale connections
  private checkConnections(): void {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes
    
    this.clients.forEach((client, clientId) => {
      if (client.lastActivity) {
        const timeSinceLastActivity = now.getTime() - client.lastActivity.getTime();
        
        if (timeSinceLastActivity > timeout) {
          this.logger.log(`Closing stale connection: ${clientId}`);
          client.close(1000, 'Connection timeout');
          this.clients.delete(clientId);
        }
      }
    });
  }

  // Generate a unique client ID
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}