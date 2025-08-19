import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MikroTikApiService } from './services/mikrotik-api.service';
import { CreateHotspotUserDto } from './dto/create-hotspot-user.dto';
import { RemoveHotspotUserDto } from './dto/remove-hotspot-user.dto';
import { RouterConfigDto } from './dto/router-config.dto';

import { Router } from './entities/router.entity';
import { Isp } from '../isps/entities/isp.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MikroTikService {
  private readonly logger = new Logger(MikroTikService.name);

  constructor(
    private readonly apiService: MikroTikApiService,
    @InjectRepository(Router)
    private readonly routerRepository: Repository<Router>,
  ) {}

  private async validateRouterOwnership(routerId: string, isp: Isp): Promise<Router> {
    const router = await this.routerRepository.findOne({
      where: { id: routerId, ispId: isp.id },
    });

    if (!router) {
      throw new ForbiddenException('Router not found or not owned by your ISP');
    }

    return router;
  }

  private async executeRouterCommand(router: Router, command: string[]): Promise<any[]> {
    return this.apiService.executeCommand({
      host: router.ipAddress,
      username: router.username || undefined,
      password: router.password || undefined,
      port: router.apiPort || undefined,
      command,
    });
  }

  // ==================== ROUTER MANAGEMENT ====================

  async getRouters(isp: Isp): Promise<Router[]> {
    return this.routerRepository.find({
      where: { ispId: isp.id },
      order: { createdAt: 'DESC' },
    });
  }

  async getRouterById(id: string, isp: Isp): Promise<Router> {
    return this.validateRouterOwnership(id, isp);
  }

  async addRouter(dto: RouterConfigDto, isp: Isp, user: User): Promise<Router> {
    // Check if router with same IP already exists for this ISP
    const existingRouter = await this.routerRepository.findOne({
      where: { ipAddress: dto.ipAddress, ispId: isp.id },
    });

    if (existingRouter) {
      throw new ConflictException(`Router with IP ${dto.ipAddress} already exists`);
    }

    // Test connection before saving
    try {
      await this.apiService.executeCommand({
        host: dto.ipAddress,
        username: dto.username,
        password: dto.password,
        port: dto.apiPort || 8728,
        command: ['/system/identity/print'],
      });
    } catch (error) {
      this.logger.error(`Failed to connect to router ${dto.ipAddress}:`, error);
      throw new BadRequestException('Unable to connect to router. Please check credentials and network connectivity.');
    }

    const router = this.routerRepository.create({
      name: dto.name,
      ipAddress: dto.ipAddress,
      apiPort: dto.apiPort || 8728,
      username: dto.username,
      password: dto.password,
      location: dto.location,
      description: dto.description,
      isActive: dto.isActive ?? true,
      ispId: isp.id,
      createdBy: user,
    });

    const savedRouter = await this.routerRepository.save(router);
    this.logger.log(`✅ Router '${dto.name}' added successfully for ISP ${isp.name}`);
    
    return savedRouter;
  }

  async updateRouter(id: string, dto: Partial<RouterConfigDto>, isp: Isp): Promise<Router> {
    const router = await this.validateRouterOwnership(id, isp);

    // If IP address is being changed, check for conflicts
    if (dto.ipAddress && dto.ipAddress !== router.ipAddress) {
      const existingRouter = await this.routerRepository.findOne({
        where: { ipAddress: dto.ipAddress, ispId: isp.id },
      });

      if (existingRouter && existingRouter.id !== id) {
        throw new ConflictException(`Router with IP ${dto.ipAddress} already exists`);
      }
    }

    // Test connection if credentials are being updated
    if (dto.ipAddress || dto.username || dto.password || dto.apiPort) {
      try {
        await this.apiService.executeCommand({
          host: dto.ipAddress || router.ipAddress,
          username: dto.username || router.username,
          password: dto.password || router.password,
          port: dto.apiPort || router.apiPort,
          command: ['/system/identity/print'],
        });
      } catch (error) {
        this.logger.error(`Failed to connect to router with new credentials:`, error);
        throw new BadRequestException('Unable to connect to router with provided credentials.');
      }
    }

    Object.assign(router, dto);
    const updatedRouter = await this.routerRepository.save(router);
    
    this.logger.log(`✅ Router '${router.name}' updated successfully`);
    return updatedRouter;
  }

  async removeRouter(id: string, isp: Isp): Promise<{ success: boolean; message: string }> {
    const router = await this.validateRouterOwnership(id, isp);
    
    await this.routerRepository.remove(router);
    this.logger.log(`✅ Router '${router.name}' removed successfully`);
    
    return {
      success: true,
      message: `Router '${router.name}' has been removed`,
    };
  }

  async testRouterConnection(id: string, isp: Isp): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    const router = await this.validateRouterOwnership(id, isp);

    try {
      const result = await this.apiService.executeCommand({
        host: router.ipAddress,
        username: router.username,
        password: router.password,
        port: router.apiPort,
        command: ['/system/identity/print'],
      });

      return {
        success: true,
        message: 'Connection successful',
        details: result[0] || {},
      };
    } catch (error) {
      this.logger.error(`Connection test failed for router ${router.name}:`, error);
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getRouterStatus(id: string, isp: Isp): Promise<{
    router: Router;
    status: 'online' | 'offline';
    systemInfo?: any;
    resources?: any;
    uptime?: string;
  }> {
    const router = await this.validateRouterOwnership(id, isp);

    try {
      // Get system identity and resources
      const [identity, resources] = await Promise.all([
        this.apiService.executeCommand({
          host: router.ipAddress,
          username: router.username,
          password: router.password,
          port: router.apiPort,
          command: ['/system/identity/print'],
        }),
        this.apiService.executeCommand({
          host: router.ipAddress,
          username: router.username,
          password: router.password,
          port: router.apiPort,
          command: ['/system/resource/print'],
        }),
      ]);

      return {
        router,
        status: 'online',
        systemInfo: identity[0] || {},
        resources: resources[0] || {},
        uptime: resources[0]?.uptime || 'Unknown',
      };
    } catch (error) {
      this.logger.error(`Failed to get status for router ${router.name}:`, error);
      return {
        router,
        status: 'offline',
      };
    }
  }

  // ==================== HOTSPOT USER MANAGEMENT ====================

  async addHotspotUser(dto: CreateHotspotUserDto, isp: Isp) {
    const router = await this.validateRouterOwnership(dto.routerId, isp);
    const { username, password, profile, server } = dto;

    const command = [
      '/ip/hotspot/user/add',
      `=name=${username}`,
      `=password=${password}`,
    ];

    if (profile) command.push(`=profile=${profile}`);
    if (server) command.push(`=server=${server}`);

    const result = await this.executeRouterCommand(router, command);
    this.logger.log(`✅ Hotspot user '${username}' added on router ${router.name}`);
    return { success: true, result };
  }

  async removeHotspotUser(dto: RemoveHotspotUserDto, isp: Isp) {
    const router = await this.validateRouterOwnership(dto.routerId, isp);

    const users = await this.executeRouterCommand(router, [
      '/ip/hotspot/user/print',
      `?name=${dto.username}`,
    ]);

    if (!users.length) {
      throw new NotFoundException(`User '${dto.username}' not found`);
    }

    const id = users[0]['.id'];

    await this.executeRouterCommand(router, [
      '/ip/hotspot/user/remove',
      `=.id=${id}`,
    ]);

    this.logger.log(`✅ Hotspot user '${dto.username}' removed from router ${router.name}`);
    return { success: true, message: 'User removed' };
  }

  async listHotspotUsers(routerId: string, isp: Isp) {
    const router = await this.validateRouterOwnership(routerId, isp);
    return this.executeRouterCommand(router, ['/ip/hotspot/user/print']);
  }

  async getConnectedUsers(routerId: string, isp: Isp) {
    const router = await this.validateRouterOwnership(routerId, isp);
    return this.executeRouterCommand(router, ['/ip/hotspot/active/print']);
  }

  async disconnectUser(mac: string, routerId: string, isp: Isp) {
    const router = await this.validateRouterOwnership(routerId, isp);

    const active = await this.executeRouterCommand(router, [
      '/ip/hotspot/active/print',
      `?mac-address=${mac}`,
    ]);

    if (!active.length) {
      return { success: false, message: 'User not found' };
    }

    const id = active[0]['.id'];

    await this.executeRouterCommand(router, [
      '/ip/hotspot/active/remove',
      `=.id=${id}`,
    ]);

    this.logger.log(`✅ MAC ${mac} disconnected from router ${router.name}`);
    return { success: true, message: `User ${mac} disconnected.` };
  }

  async rebootRouter(routerId: string, isp: Isp) {
    const router = await this.validateRouterOwnership(routerId, isp);
    await this.executeRouterCommand(router, ['/system/reboot']);
    this.logger.warn(`⚠️ Reboot triggered on router ${router.name}`);
    return { message: 'Reboot command sent' };
  }

  // ⬇️ Optional future support for PPP/queues (use same executeRouterCommand)
  async listPppUsers(routerId: string, isp: Isp) {
    const router = await this.validateRouterOwnership(routerId, isp);
    return this.executeRouterCommand(router, ['/ppp/secret/print']);
  }

  async listSimpleQueues(routerId: string, isp: Isp) {
    const router = await this.validateRouterOwnership(routerId, isp);
    return this.executeRouterCommand(router, ['/queue/simple/print']);
  }
}
