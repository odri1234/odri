import { registerAs } from '@nestjs/config';

export const tr069Config = registerAs('tr069', () => ({
  acsUrl: process.env.TR069_ACS_URL || 'http://localhost:7547/api',
  acsUsername: process.env.TR069_ACS_USERNAME || 'admin',
  acsPassword: process.env.TR069_ACS_PASSWORD || 'admin',
  connectionRequestPort: parseInt(process.env.TR069_CONNECTION_REQUEST_PORT || '7547', 10),
  connectionRequestPath: process.env.TR069_CONNECTION_REQUEST_PATH || '/tr069',
  connectionRequestUsername: process.env.TR069_CONNECTION_REQUEST_USERNAME || 'connection',
  connectionRequestPassword: process.env.TR069_CONNECTION_REQUEST_PASSWORD || 'connection',
  heartbeatInterval: parseInt(process.env.TR069_HEARTBEAT_INTERVAL || '300', 10),
  enabled: process.env.TR069_ENABLED === 'true',
}));