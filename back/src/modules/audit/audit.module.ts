import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

import { AuditLog } from './entities/audit-log.entity';
import { LoginLog } from './entities/login-log.entity';
import { SystemLog } from './entities/system-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, LoginLog, SystemLog]),
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService], // Allows other modules to use the audit service
})
export class AuditModule {}
