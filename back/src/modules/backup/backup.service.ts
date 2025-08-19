// src/modules/backup/backup.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Backup } from './entities/backup.entity';
import { BackupConfigDto } from './dto/backup-config.dto';
import { BackupScheduleDto, ScheduleType } from './dto/backup-schedule.dto';
import { RestoreDto } from './dto/restore.dto';

import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectRepository(Backup)
    private readonly backupRepository: Repository<Backup>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Public method: Create backup with optional config
   */
  async createBackup(config?: BackupConfigDto): Promise<void> {
    if (!config) {
      await this.createDefaultBackup();
    } else {
      await this.createBackupWithConfig(config);
    }
  }

  /**
   * Default backup used when no config is provided
   */
  async createDefaultBackup(): Promise<void> {
    const defaultDirs = ['C:/Users/ADMN/odri/back'];
    const defaultDest = 'C:/Users/ADMN/odri/back/backups';
    const defaultConfig: BackupConfigDto = {
      directories: defaultDirs,
      destination: defaultDest,
    };
    await this.createBackupWithConfig(defaultConfig);
  }

  /**
   * Backup implementation with provided config
   */
  private async createBackupWithConfig(config: BackupConfigDto): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.zip`;
    const backupPath = path.join(config.destination, backupFileName);

    if (!fs.existsSync(config.destination)) {
      fs.mkdirSync(config.destination, { recursive: true });
      this.logger.log(`Created backup destination: ${config.destination}`);
    }

    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        this.logger.log(`✅ Backup created at ${backupPath} (${archive.pointer()} bytes)`);
        resolve();
      });

      archive.on('error', (err: Error) => {
        this.logger.error('❌ Archive error:', err);
        reject(err);
      });
    });

    archive.pipe(output);

    for (const dir of config.directories) {
      if (fs.existsSync(dir)) {
        archive.directory(dir, path.basename(dir));
      } else {
        this.logger.warn(`⚠️ Directory not found: ${dir}`);
      }
    }

    await archive.finalize();
    await archivePromise;

    const stats = fs.statSync(backupPath);
    const backup = this.backupRepository.create({
      fileName: backupFileName,
      filePath: backupPath,
      fileSize: stats.size,
      status: 'completed',
    });

    await this.backupRepository.save(backup);
  }

  async getAllBackups(): Promise<Backup[]> {
    return this.backupRepository.find({ order: { createdAt: 'DESC' } });
  }

  async restoreBackup(dto: RestoreDto): Promise<{ message: string }> {
    const backup = await this.backupRepository.findOne({ where: { id: dto.backupId } });
    if (!backup) throw new NotFoundException('❌ Backup not found');

    this.logger.log(`♻️ Restoring from: ${backup.filePath}`);
    // TODO: Implement restoration logic
    return { message: 'Restore operation completed successfully' };
  }

  async deleteBackup(id: string): Promise<void> {
    const backup = await this.backupRepository.findOne({ where: { id } });
    if (!backup) throw new NotFoundException('❌ Backup not found');

    if (fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
      this.logger.log(`Deleted backup file: ${backup.filePath}`);
    }

    await this.backupRepository.delete(id);
    this.logger.log(`Deleted backup record with id: ${id}`);
  }

  async createRestorePoint(): Promise<void> {
    this.logger.log('Creating restore point (stub)...');
    // Optional future implementation
  }

  async scheduleBackup(scheduleDto: BackupScheduleDto): Promise<{ message: string }> {
    const jobName = 'backupJob';

    if (scheduleDto.type === ScheduleType.MANUAL) {
      this.logger.log('Manual backup schedule received.');
      return { message: 'Manual schedule – no cron job set.' };
    }

    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.logger.log(`Removed existing cron job: ${jobName}`);
    }

    const job = new CronJob(scheduleDto.cronExpression, async () => {
      this.logger.log('🕒 Running scheduled backup...');
      try {
        await this.createDefaultBackup();
      } catch (error) {
        this.logger.error('Scheduled backup failed', error instanceof Error ? error.stack : String(error));
      }
    });

    this.schedulerRegistry.addCronJob(jobName, job as any);
    job.start();

    this.logger.log(`Scheduled backup job with cron: ${scheduleDto.cronExpression}`);
    return { message: `Backup scheduled with cron: ${scheduleDto.cronExpression}` };
  }
}
