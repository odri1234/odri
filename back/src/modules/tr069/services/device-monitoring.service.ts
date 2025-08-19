import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Device, DeviceStatus } from '../entities/device.entity';
import { DeviceParameter } from '../entities/device-parameter.entity';

import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationChannel } from '../../notifications/enums/notification.enums';

@Injectable()
export class DeviceMonitoringService {
  private readonly logger = new Logger(DeviceMonitoringService.name);
  private readonly acsUrl: string;
  private readonly acsUsername: string;
  private readonly acsPassword: string;

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    
    @InjectRepository(DeviceParameter)
    private readonly parameterRepo: Repository<DeviceParameter>,
    
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.acsUrl = this.configService.get<string>('tr069.acsUrl', 'http://localhost:7547/api');
    this.acsUsername = this.configService.get<string>('tr069.acsUsername', 'admin');
    this.acsPassword = this.configService.get<string>('tr069.acsPassword', 'admin');
  }

  /**
   * Get device metrics from ACS
   */
  async getDeviceMetrics(deviceId: string): Promise<any> {
    const device = await this.deviceRepo.findOne({ where: { id: deviceId } });
    
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.acsUrl}/devices/${device.serialNumber}/metrics`, {
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
      
      // For demo purposes, return simulated metrics
      return this.getSimulatedMetrics(device);
    }
  }

  /**
   * Check device status
   */
  async checkDeviceStatus(deviceId: string): Promise<boolean> {
    const device = await this.deviceRepo.findOne({ where: { id: deviceId } });
    
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.acsUrl}/devices/${device.serialNumber}/status`, {
          auth: {
            username: this.acsUsername,
            password: this.acsPassword,
          },
        })
      );
      
      const isOnline = response.data.online === true;
      
      // Update device status if changed
      if (device.isOnline !== isOnline) {
        device.isOnline = isOnline;
        device.status = isOnline ? DeviceStatus.ACTIVE : DeviceStatus.INACTIVE;
        device.lastContactAt = isOnline ? new Date() : device.lastContactAt;
        await this.deviceRepo.save(device);
        
        // Send notification if device went offline
        if (!isOnline) {
          await this.notificationsService.queueAlertNotification(
            NotificationChannel.EMAIL,
            'admin@example.com', // This would be the ISP admin email
            `device-offline-${device.id}`, // Alert ID
            {
              subject: 'Device Offline Alert',
              templateData: {
                deviceName: device.name,
                serialNumber: device.serialNumber,
                message: `Device ${device.name} (${device.serialNumber}) is offline`,
              },
              severity: 'medium',
              ispId: device.ispId,
              referenceId: device.id,
              alertType: 'Device Offline',
            }
          );
        }
      }
      
      return isOnline;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`ACS API error: ${errorMessage}`);
      
      // For demo purposes, simulate a random status
      const isOnline = Math.random() > 0.2; // 80% chance of being online
      
      // Update device status if changed
      if (device.isOnline !== isOnline) {
        device.isOnline = isOnline;
        device.status = isOnline ? DeviceStatus.ACTIVE : DeviceStatus.INACTIVE;
        device.lastContactAt = isOnline ? new Date() : device.lastContactAt;
        await this.deviceRepo.save(device);
        
        // Send notification if device went offline
        if (!isOnline) {
          await this.notificationsService.queueAlertNotification(
            NotificationChannel.EMAIL,
            'admin@example.com', // This would be the ISP admin email
            `device-offline-${device.id}`, // Alert ID
            {
              subject: 'Device Offline Alert',
              templateData: {
                deviceName: device.name,
                serialNumber: device.serialNumber,
                message: `Device ${device.name} (${device.serialNumber}) is offline`,
              },
              severity: 'medium',
              ispId: device.ispId,
              referenceId: device.id,
              alertType: 'Device Offline',
            }
          );
        }
      }
      
      return isOnline;
    }
  }

  /**
   * Scheduled job to check all device statuses
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkAllDeviceStatuses(): Promise<void> {
    this.logger.log('Running scheduled device status check');
    
    const devices = await this.deviceRepo.find();
    
    for (const device of devices) {
      try {
        await this.checkDeviceStatus(device.id);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error checking status for device ${device.id}: ${errorMessage}`);
      }
    }
  }

  /**
   * Generate simulated metrics for demo purposes
   */
  private getSimulatedMetrics(device: Device): any {
    const now = new Date();
    const uptime = Math.floor(Math.random() * 1000000); // Random uptime in seconds
    
    return {
      deviceId: device.serialNumber,
      timestamp: now.toISOString(),
      online: device.isOnline,
      uptime,
      memory: {
        total: 512 * 1024 * 1024, // 512 MB
        free: Math.floor(Math.random() * 256) * 1024 * 1024, // Random free memory
      },
      cpu: {
        load: Math.floor(Math.random() * 100), // Random CPU load
      },
      network: {
        interfaces: [
          {
            name: 'eth0',
            mac: device.macAddress || '00:11:22:33:44:55',
            ip: device.ipAddress || '192.168.1.1',
            rx_bytes: Math.floor(Math.random() * 1000000000),
            tx_bytes: Math.floor(Math.random() * 1000000000),
            rx_packets: Math.floor(Math.random() * 1000000),
            tx_packets: Math.floor(Math.random() * 1000000),
          },
          {
            name: 'wlan0',
            mac: '00:11:22:33:44:66',
            ip: '192.168.1.1',
            rx_bytes: Math.floor(Math.random() * 1000000000),
            tx_bytes: Math.floor(Math.random() * 1000000000),
            rx_packets: Math.floor(Math.random() * 1000000),
            tx_packets: Math.floor(Math.random() * 1000000),
          },
        ],
      },
      wifi: {
        ssid: 'MyWiFiNetwork',
        channel: 6,
        clients: Math.floor(Math.random() * 20), // Random number of clients
      },
    };
  }
}