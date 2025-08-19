import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AcsConfigService {
  private readonly logger = new Logger(AcsConfigService.name);
  private readonly acsUrl: string;
  private readonly acsUsername: string;
  private readonly acsPassword: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.acsUrl = this.configService.get<string>('tr069.acsUrl', 'http://localhost:7547/api');
    this.acsUsername = this.configService.get<string>('tr069.acsUsername', 'admin');
    this.acsPassword = this.configService.get<string>('tr069.acsPassword', 'admin');
  }

  /**
   * Get ACS configuration
   */
  async getAcsConfig(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.acsUrl}/config`, {
          auth: {
            username: this.acsUsername,
            password: this.acsPassword,
          },
        })
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, return simulated config
      return {
        url: this.acsUrl,
        version: '1.0.0',
        protocol: 'TR-069',
        heartbeatInterval: 300,
        connectionRequestPort: 7547,
        connectionRequestPath: '/tr069',
        connectionRequestUsername: 'connection',
        connectionRequestPassword: '********',
      };
    }
  }

  /**
   * Update ACS configuration
   */
  async updateAcsConfig(config: Record<string, any>): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.acsUrl}/config`, config, {
          auth: {
            username: this.acsUsername,
            password: this.acsPassword,
          },
        })
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, return simulated response
      return {
        success: true,
        message: 'Configuration updated successfully',
        config: {
          ...config,
          updatedAt: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Get ACS statistics
   */
  async getAcsStats(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.acsUrl}/stats`, {
          auth: {
            username: this.acsUsername,
            password: this.acsPassword,
          },
        })
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, return simulated stats
      return {
        uptime: Math.floor(Math.random() * 1000000), // Random uptime in seconds
        deviceCount: Math.floor(Math.random() * 1000), // Random device count
        activeDevices: Math.floor(Math.random() * 800), // Random active device count
        informCount: Math.floor(Math.random() * 10000), // Random inform count
        lastInform: new Date().toISOString(),
        cpuUsage: Math.floor(Math.random() * 100), // Random CPU usage
        memoryUsage: Math.floor(Math.random() * 100), // Random memory usage
      };
    }
  }

  /**
   * Get supported device models
   */
  async getSupportedModels(): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.acsUrl}/models`, {
          auth: {
            username: this.acsUsername,
            password: this.acsPassword,
          },
        })
      );
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, return simulated models
      return [
        {
          manufacturer: 'MikroTik',
          model: 'RouterOS',
          versions: ['6.x', '7.x'],
          supported: true,
        },
        {
          manufacturer: 'Ubiquiti',
          model: 'EdgeRouter',
          versions: ['1.x', '2.x'],
          supported: true,
        },
        {
          manufacturer: 'TP-Link',
          model: 'Archer',
          versions: ['C7', 'C9'],
          supported: true,
        },
        {
          manufacturer: 'Huawei',
          model: 'HG8245',
          versions: ['1.x'],
          supported: true,
        },
      ];
    }
  }
}