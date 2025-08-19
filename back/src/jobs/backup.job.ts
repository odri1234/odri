// src/jobs/backup.job.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from '../modules/backup/backup.service';

@Injectable()
export class BackupJob {
  private readonly logger = new Logger(BackupJob.name);

  constructor(private readonly backupService: BackupService) {}

  /**
   * Daily backup job - runs every day at 2:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyBackup(): Promise<void> {
    this.logger.log('🕑 Starting daily backup at 2:00 AM...');
    try {
      await this.backupService.createBackup(); // No config passed
      this.logger.log('✅ Daily database backup completed successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.stack : String(error);
      this.logger.error('❌ Daily backup failed:', message);
    }
  }

  /**
   * Weekly restore point job - runs every Sunday at 3:00 AM
   */
  @Cron('0 3 * * 0') // Every Sunday at 3:00 AM
  async handleWeeklyRestorePoint(): Promise<void> {
    this.logger.log('🛠️ Creating weekly restore point...');
    try {
      await this.backupService.createRestorePoint();
      this.logger.log('✅ Weekly restore point created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.stack : String(error);
      this.logger.error('❌ Restore point creation failed:', message);
    }
  }
}
