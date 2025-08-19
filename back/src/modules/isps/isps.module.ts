import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IspsService } from './isps.service';
import { IspsController } from './isps.controller';
import { Isp } from './entities/isp.entity';
import { IspSettings } from './entities/isp-settings.entity';
import { IspBranding } from './entities/isp-branding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Isp, IspSettings, IspBranding])],
  controllers: [IspsController],
  providers: [IspsService],
  exports: [IspsService],
})
export class IspsModule {}
