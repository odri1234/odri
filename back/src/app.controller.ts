import {
  Controller,
  Get,
  Req,
  UseGuards,
  Version,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';

// Guards & Decorators
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { Public } from './common/decorators/public.decorator';

// Swagger
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

// Constants & Types
import { UserRole } from './modules/users/constants/user-role.constants';
import { User } from './modules/users/entities/user.entity';

interface RequestWithUser extends Request {
  user?: User;
}

@ApiTags('odri-system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'ODRI API base endpoint' })
  @ApiResponse({ status: 200, description: 'Welcome to the ODRI backend system' })
  getBase(): { message: string } {
    return { message: '👋 Welcome to the ODRI Wi-Fi Billing API' };
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Public health check for ODRI system' })
  @ApiResponse({ status: 200, description: 'ODRI system is healthy and operational' })
  getHealth(): { status: string; uptime: number; timestamp: string } {
    return {
      status: '✅ ODRI System OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('version')
  @Public()
  @ApiOperation({ summary: 'ODRI backend version info' })
  @ApiResponse({ status: 200, description: 'Current ODRI system version' })
  getVersion(): Record<string, any> {
    return this.appService.getVersionInfo();
  }

  @Get('ping')
  @Public()
  @ApiOperation({ summary: 'Ping ODRI backend' })
  @ApiResponse({ status: 200, description: 'Pong response from ODRI API' })
  getPing(): { message: string; time: string } {
    return {
      message: 'pong from ODRI',
      time: new Date().toISOString(),
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ODRI backend system metrics (admin only)' })
  @ApiResponse({ status: 200, description: 'ODRI system usage stats' })
  @ApiResponse({ status: 401, description: 'Unauthorized: User not authenticated' })
  getStats(@Req() req: RequestWithUser): any {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Not authenticated to view ODRI stats');
    }

    return this.appService.getSystemStats(user);
  }
}
