import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Version, UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/constants/user-role.constants'; // <-- fixed import path
import { AlertDto } from './dto/alert.dto';
import { HealthStatusDto } from './dto/health-status.dto';
import { MetricDto } from './dto/metric.dto';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('metrics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  async createMetric(@Body() dto: MetricDto) {
    return this.monitoringService.recordMetric(dto);
  }

  @Get('metrics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  async getMetrics(
    @Query('ispId') ispId?: string,
    @CurrentUser() user?: any
  ) {
    // Skip ispId requirement for SUPER_ADMIN
    if (!ispId && user?.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('ispId query parameter is required');
    }
    return this.monitoringService.getMetrics(ispId, undefined, user?.role);
  }

  @Post('alerts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  async createAlert(@Body() dto: AlertDto) {
    return this.monitoringService.createAlert(dto);
  }

  @Get('alerts')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  async getAlerts(
    @Query('ispId') ispId?: string,
    @CurrentUser() user?: any
  ) {
    // Skip ispId requirement for SUPER_ADMIN
    if (!ispId && user?.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('ispId query parameter is required');
    }
    return this.monitoringService.getActiveAlerts(ispId, user?.role);
  }

  @Post('health')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  async reportHealth(@Body() dto: HealthStatusDto) {
    return this.monitoringService.logHealthStatus(dto);
  }

  @Get('health')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  async getHealthStatuses(
    @Query('ispId') ispId?: string,
    @CurrentUser() user?: any
  ) {
    // Skip ispId requirement for SUPER_ADMIN
    if (!ispId && user?.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('ispId query parameter is required');
    }
    return this.monitoringService.getLatestHealthStatus(ispId, user?.role);
  }
  
  @Post('alerts/:id/resolve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  async resolveAlert(@Param('id') id: string) {
    return this.monitoringService.resolveAlert(id);
  }
}
