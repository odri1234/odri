import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Version, UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { BulkNotificationDto } from './dto/bulk-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationStatus } from './enums/notification.enums';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
@HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a single notification to a user' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  @ApiResponse({ status: 500, description: 'Failed to send notification' })
  async sendSingleNotification(@Body() dto: SendNotificationDto): Promise<boolean> {
    // Send to the first recipient in the list
    const recipient = dto.to[0];
    
    return this.notificationsService.sendNotification(
      dto.channel,
      recipient,
      dto.message,
      {
        subject: dto.subject,
        templateName: dto.templateId,
        templateData: dto.variables,
        priority: dto.priority
      }
    );
  }

  @Post('send-bulk')
@HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send multiple notifications in bulk' })
  @ApiResponse({ status: 200, description: 'Bulk notifications sent successfully' })
  async sendBulkNotifications(@Body() dto: BulkNotificationDto): Promise<{ to: string; success: boolean }[]> {
    return this.notificationsService.sendBulkNotifications({
      to: dto.recipients,
      channel: dto.channel,
      message: dto.message,
      subject: dto.subject,
      templateId: dto.templateId,
      variables: dto.variables,
      priority: dto.priority
    });
  }

  @Get('logs')
@ApiOperation({ summary: 'Retrieve notification logs (optional filter by status)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: NotificationStatus,
    description: 'Filter logs by notification status',
  })
  async getNotificationLogs(@Query('status') status?: NotificationStatus) {
    return this.notificationsService.getNotificationLogs(status);
  }

  @Get('templates')
@ApiOperation({ summary: 'List all available notification templates' })
  async getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Get('template/:id')
@ApiOperation({ summary: 'Get a notification template by its ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Template ID (UUID)',
    example: '94d42e4e-0842-4b3a-bcde-09ecb1245678',
  })
  async getTemplateById(@Param('id') id: string) {
    return this.notificationsService.getTemplateById(id);
  }
}
