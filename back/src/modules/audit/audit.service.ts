import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';

import { AuditLog } from './entities/audit-log.entity';
import { LoginLog } from './entities/login-log.entity';
import { SystemLog, LogLevel } from './entities/system-log.entity';

import { AuditQueryDto } from './dto/audit-query.dto';
import { LogEntryDto } from './dto/log-entry.dto';
import { LogAction } from './enums/log-action.enum';

import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { CreateLoginLogDto } from './dto/create-login-log.dto';
import { CreateSystemLogDto } from './dto/create-system-log.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,

    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,

    @InjectRepository(SystemLog)
    private readonly systemLogRepo: Repository<SystemLog>,
  ) {}

  async createAuditLog(entry: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepo.create(entry);
    return this.auditLogRepo.save(log);
  }

  async createLoginLog(entry: CreateLoginLogDto): Promise<LoginLog> {
    const log = this.loginLogRepo.create(entry);
    return this.loginLogRepo.save(log);
  }

  async createSystemLog(entry: CreateSystemLogDto): Promise<SystemLog> {
    const log = this.systemLogRepo.create({
      level: entry.level,
      source: entry.source,
      message: entry.message,
      meta: entry.meta,
    });

    return this.systemLogRepo.save(log);
  }

  private buildDateFilter<T>(filter: AuditQueryDto, field: keyof T): any {
    if (filter.from && filter.to) {
      return Between(filter.from, filter.to);
    }
    if (filter.from) {
      return MoreThanOrEqual(filter.from);
    }
    if (filter.to) {
      return LessThanOrEqual(filter.to);
    }
    return undefined;
  }

  async getAuditLogs(filter: AuditQueryDto): Promise<AuditLog[]> {
    const where: any = {};

    if (filter.userId) where.userId = filter.userId;
    if (filter.action) where.action = filter.action;

    const dateFilter = this.buildDateFilter<AuditLog>(filter, 'timestamp');
    if (dateFilter) where.timestamp = dateFilter;

    const options: FindManyOptions<AuditLog> = {
      where,
      order: { timestamp: 'DESC' },
      take: filter.limit ?? 20,
      skip: ((filter.page ?? 1) - 1) * (filter.limit ?? 20),
    };

    return this.auditLogRepo.find(options);
  }

  async getLoginLogs(filter: AuditQueryDto): Promise<LoginLog[]> {
    const where: any = {};

    if (filter.userId) where.userId = filter.userId;
    if ('status' in filter && filter.status) where.status = filter.status;

    const dateFilter = this.buildDateFilter<LoginLog>(filter, 'timestamp');
    if (dateFilter) where.timestamp = dateFilter;

    const options: FindManyOptions<LoginLog> = {
      where,
      order: { timestamp: 'DESC' },
      take: filter.limit ?? 20,
      skip: ((filter.page ?? 1) - 1) * (filter.limit ?? 20),
    };

    return this.loginLogRepo.find(options);
  }

  async getSystemLogs(filter: AuditQueryDto): Promise<SystemLog[]> {
    const where: any = {};

    if (filter.level) where.level = filter.level;
    if (filter.message) where.message = filter.message;

    const dateFilter = this.buildDateFilter<SystemLog>(filter, 'timestamp');
    if (dateFilter) where.timestamp = dateFilter;

    const options: FindManyOptions<SystemLog> = {
      where,
      order: { timestamp: 'DESC' },
      take: filter.limit ?? 20,
      skip: ((filter.page ?? 1) - 1) * (filter.limit ?? 20),
    };

    return this.systemLogRepo.find(options);
  }

  async getAggregatedLogs(filter: AuditQueryDto): Promise<LogEntryDto[]> {
    const [auditLogs, loginLogs, systemLogs] = await Promise.all([
      this.getAuditLogs(filter),
      this.getLoginLogs(filter),
      this.getSystemLogs(filter),
    ]);

    const mappedLogs: LogEntryDto[] = [
      ...auditLogs.map(log => this.mapAuditLogToEntry(log)),
      ...loginLogs.map(log => this.mapLoginLogToEntry(log)),
      ...systemLogs.map(log => this.mapSystemLogToEntry(log)),
    ];

    return mappedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async queryLogs(query: AuditQueryDto): Promise<LogEntryDto[]> {
    return this.getAggregatedLogs(query);
  }

  private mapAuditLogToEntry(log: AuditLog): LogEntryDto {
    return {
      id: log.id,
      timestamp: log.timestamp,
      action: log.action,
      userId: log.userId,
      username: log.username || 'N/A',
      description: log.description || 'Audit action',
      route: log.route,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    };
  }

  private mapLoginLogToEntry(log: LoginLog): LogEntryDto {
    return {
      id: log.id,
      timestamp: log.timestamp,
      action: log.success ? LogAction.LOGIN : LogAction.FAILURE,
      userId: log.userId || 'unknown',
      username: log.username || 'unknown',
      description: `Login attempt - ${log.success ? 'Success' : 'Failed'}`,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
    };
  }

  private mapSystemLogToEntry(log: SystemLog): LogEntryDto {
    return {
      id: log.id,
      timestamp: log.timestamp,
      action: LogAction.SYSTEM,
      userId: 'system',
      username: 'System',
      description: log.message,
    };
  }

  async getLogById(id: string): Promise<LogEntryDto> {
    const auditLog = await this.auditLogRepo.findOne({ where: { id } });
    if (auditLog) return this.mapAuditLogToEntry(auditLog);

    const loginLog = await this.loginLogRepo.findOne({ where: { id } });
    if (loginLog) return this.mapLoginLogToEntry(loginLog);

    const systemLog = await this.systemLogRepo.findOne({ where: { id } });
    if (systemLog) return this.mapSystemLogToEntry(systemLog);

    throw new NotFoundException('Log entry not found');
  }
}
