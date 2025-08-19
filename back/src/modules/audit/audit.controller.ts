import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  Version, UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { AuditQueryDto } from './dto/audit-query.dto';
import { LogEntryDto } from './dto/log-entry.dto';
import { UserRole } from '../users/constants/user-role.constants';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Query logs with filters
   */
  @Get('logs')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Query audit logs with filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved successfully.',
    type: [LogEntryDto],
  })
  @HttpCode(HttpStatus.OK)
  async getLogs(
    @Query() query: AuditQueryDto,
  ): Promise<LogEntryDto[]> {
    return this.auditService.queryLogs(query);
  }

  /**
   * Retrieve a single audit log by its ID
   */
  @Get('logs/:id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get a single audit log entry by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit log retrieved successfully.',
    type: LogEntryDto,
  })
  @HttpCode(HttpStatus.OK)
  async getLogById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LogEntryDto> {
    return this.auditService.getLogById(id);
  }
}
