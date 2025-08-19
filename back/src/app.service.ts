import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { User } from './modules/users/entities/user.entity';
import { Voucher } from './modules/vouchers/entities/voucher.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Session } from './modules/sessions/entities/session.entity';

import { AppVersion } from './common/constants/config.constant';

interface VersionInfo {
  system: string;
  version: string;
  build: string;
  releaseDate: string;
  uptime: number;
  nodeVersion: string;
  timestamp: string;
}

interface SystemStats {
  totalUsers: number;
  activeSessions: number;
  totalVouchers: number;
  totalPayments: number;
  totalRevenue: number;
  requestedBy: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get version and metadata about the current system build
   */
  getVersionInfo(): VersionInfo {
    return {
      system: 'ODRI ISPs Billing System',
      version: AppVersion.VERSION || '1.0.0',
      build: process.env.APP_BUILD || 'dev',
      releaseDate: process.env.APP_RELEASE_DATE || 'N/A',
      uptime: process.uptime(),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate statistical system overview
   */
  async getSystemStats(user: { email?: string } | null): Promise<SystemStats> {
    const [
      totalUsers,
      activeSessions,
      totalPayments,
      totalVouchers
    ] = await Promise.all([
      this.dataSource.getRepository(User).count(),
      this.dataSource.getRepository(Session).countBy({ isActive: true }),
      this.dataSource.getRepository(Payment).count(),
      this.dataSource.getRepository(Voucher).count(),
    ]);

    const revenueResult = await this.dataSource
      .getRepository(Payment)
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'sum')
      .getRawOne<{ sum: string | null }>();

    const totalRevenue = parseFloat(revenueResult?.sum || '0');

    return {
      totalUsers,
      activeSessions,
      totalPayments,
      totalVouchers,
      totalRevenue,
      requestedBy: user?.email || 'system',
      timestamp: new Date().toISOString(),
    };
  }
}
