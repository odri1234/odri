// C:\Users\ADMN\odri\back\src\modules\monitoring\alert.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertSeverity } from './entities/alert.entity';
import { AlertType } from './dto/alert.dto'; // make sure this path is correct

interface CreateAlertDto {
  title: string;
  message: string;
  type: AlertType;
  severity?: AlertSeverity;
  target?: string;
  triggeredById?: string;
  ispId?: string;
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
  ) {}

  async createSystemAlert(data: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepo.create({
      name: data.title,              // maps to 'name' column
      message: data.message,
      type: data.type,
      severity: data.severity ?? AlertSeverity.INFO,
      target: data.target,
      resolved: false,
      // You can also add relations if needed (triggeredBy, isp) by loading entities or using IDs
    });

    await this.alertRepo.save(alert);

    this.logger.log(`Created alert: ${data.title}`);

    return alert;
  }

  // Add more alert service methods here as needed (e.g. resolveAlert, getAlerts, etc.)
}
