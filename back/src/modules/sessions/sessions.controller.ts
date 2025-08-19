// sessions/sessions.controller.ts
import {
  Version, Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionStatsDto } from './dto/session-stats.dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(
    @Body() createSessionDto: CreateSessionDto,
    @Query('ispId') ispId: string,
  ) {
    return this.sessionsService.createSession(createSessionDto, ispId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @Query('ispId') ispId: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionsService.updateSession(id, updateSessionDto, ispId, user?.role);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Query('ispId') ispId: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionsService.deleteSession(id, ispId, user?.role);
  }

  @Get('active')
  findAllActive(
    @Query('ispId') ispId: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionsService.findAllActive(ispId, user?.role);
  }

  @Get(':id/stats')
  getStats(
    @Param('id') sessionId: string,
    @Query('ispId') ispId: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionsService.getSessionStats(sessionId, ispId, user?.role);
  }

  @Patch(':id/close')
  close(
    @Param('id') id: string,
    @Query('ispId') ispId: string,
  ) {
    return this.sessionsService.closeSession(id, ispId);
  }
}
