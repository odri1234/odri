import {
  Controller,
  Get,
  Query,
  Version, UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/constants/user-role.constants';  // Updated import path here

import { ReportRequestDto } from './dto/report-request.dto';
import { RevenueSummaryDto } from './dto/revenue-summary.dto';
import { UsageSummaryDto } from './dto/usage-summary.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue-summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  @ApiOperation({ summary: 'Get revenue summary for ISP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Revenue summary retrieved successfully',
    type: RevenueSummaryDto,
  })
  @HttpCode(HttpStatus.OK)
  async getRevenueSummary(
    @Query() query: ReportRequestDto,
  ): Promise<RevenueSummaryDto> {
    return this.analyticsService.getRevenueSummary(query);
  }

  @Get('usage-summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  @ApiOperation({ summary: 'Get usage summary for ISP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usage summary retrieved successfully',
    type: UsageSummaryDto,
  })
  @HttpCode(HttpStatus.OK)
  async getUsageSummary(
    @Query() query: ReportRequestDto,
  ): Promise<UsageSummaryDto> {
    return this.analyticsService.getUsageSummary(query);
  }

  @Get('reports')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate full analytics report' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics report generated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async generateReport(@Query() query: ReportRequestDto) {
    return this.analyticsService.generateFullReport(query);
  }
}
