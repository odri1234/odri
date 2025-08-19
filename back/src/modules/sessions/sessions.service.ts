import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { LessThan } from 'typeorm';

// Entities
import { Session } from './entities/session.entity';
import { Device } from './entities/device.entity';
import { UsageLog } from './entities/usage-log.entity';

// DTOs
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionStatsDto } from './dto/session-stats.dto';

// Repositories
import { SessionRepository } from './repositories/session.repository';
import { UsageLogRepository } from './repositories/usage-log.repository';
import { DeviceRepository } from './repositories/device.repository'; // ✅ Add this

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly usageLogRepo: UsageLogRepository,
    private readonly deviceRepo: DeviceRepository, // ✅ Inject here
  ) {}

  async createSession(dto: CreateSessionDto, ispId: string): Promise<Session> {
    const session = this.sessionRepo.create({
      ...dto,
      ispId,
      isActive: true,
      startTime: new Date(),
    });

    const saved = await this.sessionRepo.save(session);
    this.logger.log(`Session created for user ${dto.userId}`);
    return saved;
  }

  async updateSession(id: string, dto: UpdateSessionDto, ispId: string, userRole?: string): Promise<Session> {
    // Skip ispId filtering for SUPER_ADMIN role
    const where = userRole === 'SUPER_ADMIN' ? { id } : { id, ispId };
    const session = await this.sessionRepo.findOne({ where });
    if (!session) throw new NotFoundException('Session not found');

    Object.assign(session, dto);
    return this.sessionRepo.save(session);
  }

  async closeSession(id: string, ispId: string, userRole?: string): Promise<Session> {
    // Skip ispId filtering for SUPER_ADMIN role
    const where = userRole === 'SUPER_ADMIN' ? { id } : { id, ispId };
    const session = await this.sessionRepo.findOne({ where });
    if (!session) throw new NotFoundException('Session not found');

    session.isActive = false;
    session.endTime = new Date();
    return this.sessionRepo.save(session);
  }

  async logDevice(
    sessionId: string,
    macAddress: string,
    deviceName?: string,
    deviceType?: string,
    ipAddress?: string,
  ): Promise<Device> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const device = this.deviceRepo.create({
      session,
      macAddress,
      deviceName: deviceName || 'Unknown Device',
      deviceType,
      ipAddress,
    });

    return this.deviceRepo.save(device);
  }

  async logUsage(
    sessionId: string,
    uploadBytes: number,
    downloadBytes: number,
  ): Promise<UsageLog> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const usage = this.usageLogRepo.create({
      session,
      user: session.user,
      uploadBytes,
      downloadBytes,
      usageStartTime: new Date(),
    });

    return this.usageLogRepo.save(usage);
  }

  async getSessionStats(sessionId: string, ispId: string, userRole?: string): Promise<SessionStatsDto> {
    // Skip ispId filtering for SUPER_ADMIN role
    const where = userRole === 'SUPER_ADMIN' ? { id: sessionId } : { id: sessionId, ispId };
    const session = await this.sessionRepo.findOne({
      where,
      relations: ['user'],
    });
    if (!session) throw new NotFoundException('Session not found');

    const logs = await this.usageLogRepo.find({ where: { session: { id: sessionId } } });

    const totalIn = logs.reduce((sum, log) => sum + log.uploadBytes, 0);
    const totalOut = logs.reduce((sum, log) => sum + log.downloadBytes, 0);

    return {
      sessionId: session.id,
      userId: session.user.id,
      totalBytesIn: totalIn,
      totalBytesOut: totalOut,
      startTime: session.startTime,
      endTime: session.endTime || null,
    };
  }

  async findAllActive(ispId: string, userRole?: string): Promise<Session[]> {
    // Skip ispId filtering for SUPER_ADMIN role
    const where = userRole === 'SUPER_ADMIN' 
      ? { isActive: true } 
      : { ispId, isActive: true };
    
    return this.sessionRepo.find({
      where,
      relations: ['devices', 'user'],
    });
  }

  async deleteSession(id: string, ispId: string, userRole?: string): Promise<void> {
    // Skip ispId filtering for SUPER_ADMIN role
    const where = userRole === 'SUPER_ADMIN' ? { id } : { id, ispId };
    const session = await this.sessionRepo.findOne({ where });
    if (!session) throw new NotFoundException('Session not found');

    await this.sessionRepo.remove(session);
  }

  async cleanupExpiredSessions(): Promise<{ cleanedCount: number }> {
    const now = new Date();
    const expired = await this.sessionRepo.find({
      where: {
        isActive: false,
        endTime: LessThan(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)), // 30 days old
      },
    });

    await this.sessionRepo.remove(expired);
    this.logger.log(`Cleaned up ${expired.length} expired sessions`);
    return { cleanedCount: expired.length };
  }

  async archiveOldUsageLogs(): Promise<number> {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6); // older than 6 months

    const oldLogs = await this.usageLogRepo.find({
      where: { usageEndTime: LessThan(cutoff) },
    });

    await this.usageLogRepo.remove(oldLogs);
    this.logger.log(`Archived ${oldLogs.length} old usage logs`);
    return oldLogs.length;
  }

  async cleanupInactiveDevices(): Promise<number> {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);

    const devices = await this.deviceRepo.find({
      where: {
        updatedAt: LessThan(cutoff),
      },
    });

    await this.deviceRepo.remove(devices);
    this.logger.log(`Removed ${devices.length} inactive devices`);
    return devices.length;
  }
}
