import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Version, UseGuards,
  Query,
  Delete,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { MikroTikService } from './mikrotik.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateHotspotUserDto } from './dto/create-hotspot-user.dto';
import { RemoveHotspotUserDto } from './dto/remove-hotspot-user.dto';
import { RouterConfigDto } from './dto/router-config.dto';
import { CurrentIsp } from '../auth/decorators/current-isp.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Isp } from '../isps/entities/isp.entity';
import { User } from '../users/entities/user.entity';

@ApiTags('MikroTik')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mikrotik')
export class MikroTikController {
  constructor(private readonly mikrotikService: MikroTikService) {}

  // ==================== ROUTER MANAGEMENT ====================

  @Get('routers')
@ApiOperation({ summary: 'Get all routers for the current ISP' })
  @ApiResponse({ status: 200, description: 'List of routers' })
  async getRouters(@CurrentIsp() isp: Isp) {
    if (!isp) {
      throw new BadRequestException('ISP information not available. Please ensure you are authenticated and have proper permissions.');
    }
    return await this.mikrotikService.getRouters(isp);
  }

  @Get('routers/:id')
@ApiOperation({ summary: 'Get router details by ID' })
  @ApiResponse({ status: 200, description: 'Router details' })
  async getRouterById(
    @CurrentIsp() isp: Isp,
    @Param('id') id: string,
  ) {
    return await this.mikrotikService.getRouterById(id, isp);
  }

  @Post('routers')
@ApiOperation({ summary: 'Add a new MikroTik router' })
  @ApiResponse({ status: 201, description: 'Router added successfully' })
  @ApiBody({ type: RouterConfigDto })
  async addRouter(
    @CurrentIsp() isp: Isp,
    @CurrentUser() user: User,
    @Body() dto: RouterConfigDto,
  ) {
    return await this.mikrotikService.addRouter(dto, isp, user);
  }

  @Put('routers/:id')
@ApiOperation({ summary: 'Update router configuration' })
  @ApiResponse({ status: 200, description: 'Router updated successfully' })
  async updateRouter(
    @CurrentIsp() isp: Isp,
    @Param('id') id: string,
    @Body() dto: Partial<RouterConfigDto>,
  ) {
    return await this.mikrotikService.updateRouter(id, dto, isp);
  }

  @Delete('routers/:id')
@ApiOperation({ summary: 'Remove a router' })
  @ApiResponse({ status: 200, description: 'Router removed successfully' })
  async removeRouter(
    @CurrentIsp() isp: Isp,
    @Param('id') id: string,
  ) {
    return await this.mikrotikService.removeRouter(id, isp);
  }

  @Post('routers/:id/test-connection')
@ApiOperation({ summary: 'Test connection to a router' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testRouterConnection(
    @CurrentIsp() isp: Isp,
    @Param('id') id: string,
  ) {
    return await this.mikrotikService.testRouterConnection(id, isp);
  }

  @Get('routers/:id/status')
@ApiOperation({ summary: 'Get router status and health' })
  @ApiResponse({ status: 200, description: 'Router status information' })
  async getRouterStatus(
    @CurrentIsp() isp: Isp,
    @Param('id') id: string,
  ) {
    return await this.mikrotikService.getRouterStatus(id, isp);
  }

  // ==================== HOTSPOT USER MANAGEMENT ====================

  @Post('add-hotspot-user')
@ApiOperation({ summary: 'Add a new Hotspot user to MikroTik' })
  @ApiResponse({ status: 201, description: 'User added successfully' })
  async addHotspotUser(
    @CurrentIsp() isp: Isp,
    @Body() dto: CreateHotspotUserDto,
  ) {
    return await this.mikrotikService.addHotspotUser(dto, isp);
  }

  @Post('remove-hotspot-user')
@ApiOperation({ summary: 'Remove a Hotspot user from MikroTik' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  async removeHotspotUser(
    @CurrentIsp() isp: Isp,
    @Body() dto: RemoveHotspotUserDto,
  ) {
    return await this.mikrotikService.removeHotspotUser(dto, isp);
  }

  @Get('hotspot-users')
@ApiOperation({ summary: 'List all Hotspot users from MikroTik' })
  @ApiResponse({ status: 200, description: 'List of Hotspot users' })
  async listHotspotUsers(
    @CurrentIsp() isp: Isp,
    @Query('routerId') routerId?: string,
  ) {
    if (!routerId) {
      throw new BadRequestException('routerId is required');
    }
    return await this.mikrotikService.listHotspotUsers(routerId, isp);
  }

  @Get('connected-users')
@ApiOperation({ summary: 'List currently connected Hotspot users' })
  @ApiResponse({ status: 200, description: 'Connected users' })
  async connectedUsers(
    @CurrentIsp() isp: Isp,
    @Query('routerId') routerId?: string,
  ) {
    if (!routerId) {
      throw new BadRequestException('routerId is required');
    }
    return await this.mikrotikService.getConnectedUsers(routerId, isp);
  }

  @Delete('disconnect-user/:mac')
@ApiOperation({ summary: 'Disconnect a user from MikroTik by MAC address' })
  @ApiResponse({ status: 200, description: 'User disconnected' })
  async disconnectUser(
    @CurrentIsp() isp: Isp,
    @Param('mac') mac: string,
    @Query('routerId') routerId?: string,
  ) {
    if (!routerId) {
      throw new BadRequestException('routerId is required');
    }
    return await this.mikrotikService.disconnectUser(mac, routerId, isp);
  }
}
