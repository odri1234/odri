// src/modules/mikrotik/mikrotik.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MikroTikController } from './mikrotik.controller';
import { MikroTikService } from './mikrotik.service';
import { MikroTikApiService } from './services/mikrotik-api.service';
import { MikrotikConfigService } from './services/mikrotik-config.service';

import { Router } from './entities/router.entity';
import { RouterCommandLog } from './entities/router-command-log.entity';
import { HotspotProfile } from './entities/hotspot-profile.entity';
import { PppoeProfile } from './entities/pppoe-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Router,
      RouterCommandLog,
      HotspotProfile,
      PppoeProfile,
    ]),
  ],
  controllers: [MikroTikController],
  providers: [
    MikroTikService,
    MikroTikApiService,
    MikrotikConfigService,
  ],
  exports: [MikroTikService],
})
export class MikroTikModule {}
