import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLog } from './entities/usage-log.entity';
import { UsageLogRepository } from './repositories/usage-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UsageLog])],
  providers: [UsageLogRepository],
  exports: [UsageLogRepository],
})
export class UsageModule {}
