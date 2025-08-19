import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { SessionsController } from './sessions.controller';

// Services
import { SessionsService } from './sessions.service';

// Entities
import { Session } from './entities/session.entity';
import { Device } from './entities/device.entity';
import { UsageLog } from './entities/usage-log.entity';

// Repositories
import { SessionRepository } from './repositories/session.repository';
import { UsageLogRepository } from './repositories/usage-log.repository';
import { DeviceRepository } from './repositories/device.repository'; // ✅ If using custom repo

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session,
      Device,
      UsageLog,
    ]),
  ],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    SessionRepository,
    UsageLogRepository,
    DeviceRepository, // ✅ If using
  ],
  exports: [
    SessionsService,
    SessionRepository, // ✅ MUST be here
    UsageLogRepository,
    DeviceRepository, // ✅ If needed
  ],
})
export class SessionsModule {}
