import {
  Controller,
  Post,
  Body,
  Version, UseGuards,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/constants/user-role.constants';  // <-- Corrected import path here
import { BackupScheduleDto } from './dto/backup-schedule.dto';
import { BackupConfigDto } from './dto/backup-config.dto';
import { RestoreDto } from './dto/restore.dto';

@Controller('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createBackup(@Body() config: BackupConfigDto) {
    return this.backupService.createBackup(config);
  }

  @Post('restore')
  @Roles(UserRole.SUPER_ADMIN)
  async restoreBackup(@Body() dto: RestoreDto) {
    return this.backupService.restoreBackup(dto);
  }

  @Get('all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getAllBackups() {
    return this.backupService.getAllBackups();
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async deleteBackup(@Param('id') id: string) {
    await this.backupService.deleteBackup(id);
    return { message: 'Backup deleted successfully' };
  }

  @Post('schedule')
  @Roles(UserRole.SUPER_ADMIN)
  async scheduleBackup(@Body() scheduleDto: BackupScheduleDto) {
    return this.backupService.scheduleBackup(scheduleDto);
  }
}
