import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction, PredictionType } from '../entities/prediction.entity';
import { Device } from '../../tr069/entities/device.entity';
import { Router } from '../../mikrotik/entities/router.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationChannel } from '../../notifications/enums/notification.enums';

@Injectable()
export class MaintenancePredictionService {
  private readonly logger = new Logger(MaintenancePredictionService.name);

  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepo: Repository<Prediction>,
    
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    
    @InjectRepository(Router)
    private readonly routerRepo: Repository<Router>,
    
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Predict device failure probability
   */
  async predictDeviceFailure(
    deviceId: string, 
    deviceType: 'device' | 'router',
    ispId: string,
  ): Promise<Prediction> {
    this.logger.log(`Predicting failure for ${deviceType} ${deviceId}`);
    
    // Get device
    let device: Device | Router | null;
    if (deviceType === 'device') {
      device = await this.deviceRepo.findOne({ where: { id: deviceId } });
    } else {
      device = await this.routerRepo.findOne({ where: { id: deviceId } });
    }
    
    if (!device) {
      throw new Error(`${deviceType} with ID ${deviceId} not found`);
    }
    
    // Since we don't have metrics repositories, we'll use simulated metrics
    // In a real implementation, you would fetch metrics from a database or monitoring service
    
    // Simulate device health metrics based on device properties
    const deviceAge = deviceType === 'router' 
      ? Math.floor(Math.random() * 730) // Random age up to 2 years in days
      : Math.floor(Math.random() * 365); // Random age up to 1 year in days
      
    const avgCpu = 30 + Math.floor(Math.random() * 40); // 30-70% CPU usage
    const avgMemory = 40 + Math.floor(Math.random() * 30); // 40-70% memory usage
    const uptimeDrops = Math.floor(Math.random() * 3); // 0-2 reboots
    
    // Calculate failure probability
    // High CPU/memory usage and frequent reboots increase failure probability
    let failureProbability = 0;
    
    // CPU factor (0-0.4)
    failureProbability += (avgCpu / 100) * 0.4;
    
    // Memory factor (0-0.3)
    failureProbability += (avgMemory / 100) * 0.3;
    
    // Reboot factor (0-0.3)
    const rebootFactor = Math.min(uptimeDrops / 5, 1) * 0.3;
    failureProbability += rebootFactor;
    
    // Age factor (older devices more likely to fail)
    failureProbability += (deviceAge / (deviceType === 'router' ? 730 : 365)) * 0.2;
    failureProbability = Math.min(failureProbability, 0.95); // Cap at 95%
    
    // Estimate time to failure (in days)
    // Lower probability = longer time to failure
    const timeToFailure = Math.max(1, Math.round((1 - failureProbability) * 90));
    
    // Create prediction record
    const prediction = new Prediction();
    prediction.type = PredictionType.DEVICE_FAILURE;
    prediction.referenceId = deviceId;
    prediction.referenceType = deviceType;
    prediction.ispId = ispId;
    
    // Map to the actual entity structure
    prediction.value = failureProbability;
    prediction.unit = 'probability';
    prediction.targetDate = new Date(Date.now() + timeToFailure * 24 * 60 * 60 * 1000);
    prediction.modelUsed = 'heuristic-v1';
    prediction.context = `Prediction based on simulated metrics. Factors: CPU=${avgCpu.toFixed(2)}%, Memory=${avgMemory.toFixed(2)}%, Reboots=${uptimeDrops}`;
    prediction.result = {
      failureProbability,
      timeToFailure,
      unit: 'days',
      modelUsed: 'heuristic-v1'
    };
    
    const savedPrediction = await this.predictionRepo.save(prediction);
    
    // Send notification if high failure probability
    if (failureProbability >= 0.6) {
      const deviceName = device.name || deviceId;
      
      await this.notificationsService.sendNotification(
        NotificationChannel.EMAIL,
        'admin@example.com', // Recipient
        `High failure probability (${(failureProbability * 100).toFixed(0)}%) detected for ${deviceType} ${deviceName}. Estimated time to failure: ${timeToFailure} days.`,
        {
          subject: `High failure probability detected for ${deviceType}`
        }
      );
    }
    
    return savedPrediction;
  }

  /**
   * Predict optimal maintenance schedule for a device
   */
  async predictMaintenanceSchedule(deviceId: string): Promise<Prediction> {
    this.logger.log(`Predicting maintenance schedule for device ${deviceId}`);
    
    // Get failure prediction
    const failurePrediction = await this.predictionRepo.findOne({
      where: { 
        referenceId: deviceId,
        type: PredictionType.DEVICE_FAILURE,
      },
      order: { detectedAt: 'DESC' },
    });
    
    if (!failurePrediction) {
      throw new Error(`No failure prediction found for device ${deviceId}`);
    }
    
    // Calculate optimal maintenance time
    // Typically schedule maintenance at 80% of the predicted time to failure
    const timeToFailure = failurePrediction.result.timeToFailure || 30;
    const maintenanceTime = Math.max(1, Math.round(timeToFailure * 0.8));
    
    // Create prediction record
    const prediction = new Prediction();
    prediction.type = PredictionType.MAINTENANCE_SCHEDULE;
    prediction.referenceId = deviceId;
    prediction.referenceType = 'device'; // Default to device if not available
    prediction.ispId = failurePrediction.ispId;
    
    // Map to the actual entity structure
    prediction.value = maintenanceTime;
    prediction.unit = 'days';
    prediction.targetDate = new Date(Date.now() + maintenanceTime * 24 * 60 * 60 * 1000);
    prediction.modelUsed = 'maintenance-scheduler-v1';
    prediction.context = `Based on failure prediction ${failurePrediction.id}`;
    prediction.result = {
      recommendedMaintenanceIn: maintenanceTime,
      unit: 'days',
      urgency: maintenanceTime < 7 ? 'high' : maintenanceTime < 30 ? 'medium' : 'low',
      basedOn: {
        failurePredictionId: failurePrediction.id,
        failureProbability: failurePrediction.value,
        timeToFailure,
      },
    };
    
    return this.predictionRepo.save(prediction);
  }
}