import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Entities
import { User } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Client } from './entities/client.entity';
import { Isp } from '../isps/entities/isp.entity';
import { IspSettings } from '../isps/entities/isp-settings.entity';
import { IspBranding } from '../isps/entities/isp-branding.entity'; // ✅ Added missing import

// Modules
import { IspsModule } from '../isps/isps.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Admin,
      Client,
      Isp,
      IspSettings,
      IspBranding, // ✅ Registered missing entity
    ]),
    forwardRef(() => IspsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [
    UsersService,
    TypeOrmModule,
  ],
})
export class UsersModule {}
