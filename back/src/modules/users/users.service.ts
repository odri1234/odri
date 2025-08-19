import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between, EntityManager } from 'typeorm';

import { User } from './entities/user.entity';
import { UserRole } from './constants/user-role.constants';
import { Admin } from './entities/admin.entity';
import { Client } from './entities/client.entity';
import { Isp } from '../isps/entities/isp.entity';
import { IspSettings } from '../isps/entities/isp-settings.entity';
import { IspBranding } from '../isps/entities/isp-branding.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(Isp)
    private readonly ispRepo: Repository<Isp>,

    @InjectRepository(IspSettings)
    private readonly settingsRepo: Repository<IspSettings>,

    @InjectRepository(IspBranding)
    private readonly brandingRepo: Repository<IspBranding>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    // Check for existing user with better error handling
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('User with this email already exists');
      }
      if (existing.phone === dto.phone) {
        throw new ConflictException('User with this phone number already exists');
      }
    }

    // Handle ISP relationship with better validation
    let isp: Isp | undefined = undefined;

    if (dto.ispId) {
      const foundIsp = await this.ispRepo.findOne({ 
        where: { id: dto.ispId, isActive: true } // Only allow active ISPs
      });
      
      if (!foundIsp) {
        throw new BadRequestException('Invalid or inactive ISP ID');
      }
      
      isp = foundIsp;
    }

    // Validate ISP requirement for clients
    if (dto.role === UserRole.CLIENT && !isp) {
      throw new BadRequestException('ISP ID is required for client users');
    }

    // Use transaction to ensure data consistency
    return await this.userRepo.manager.transaction(async (manager: EntityManager) => {
      try {
        // Create user with proper type handling
        const userToCreate = {
          email: dto.email,
          fullName: dto.fullName,
          phone: dto.phone,
          password: dto.password, // This should be hashed by entity hooks
          role: dto.role,
          isActive: dto.isActive ?? true,
          expiryDate: dto.expiryDate,
          // Only include isp if it exists
          ...(isp && { isp }),
        };

        const user = manager.create(User, userToCreate);
        const savedUser = await manager.save(User, user);

        // Handle role-specific entity creation
        await this.createRoleSpecificEntityInTransaction(dto, savedUser, isp, manager);

        return savedUser;
      } catch (error) {
        console.error('Error in user creation transaction:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new BadRequestException(`Failed to create user: ${errorMessage}`);
      }
    });
  }

  private async createRoleSpecificEntityInTransaction(
    dto: CreateUserDto,
    savedUser: User,
    isp: Isp | undefined,
    manager: EntityManager,
  ): Promise<void> {
    switch (dto.role) {
      case UserRole.ADMIN: {
        const adminData = { 
          user: savedUser,
          // Add any admin-specific fields from dto if needed
        };
        const admin = manager.create(Admin, adminData);
        await manager.save(Admin, admin);
        break;
      }

      case UserRole.CLIENT: {
        if (!isp) {
          throw new BadRequestException('ISP is required for client users');
        }
        
        const clientData = { 
          user: savedUser, 
          isp,
          // Add any client-specific fields from dto if needed
        };
        const client = manager.create(Client, clientData);
        await manager.save(Client, client);
        break;
      }

      case UserRole.ISP_ADMIN: {
        await this.createIspWithSettingsInTransaction(dto, savedUser, manager);
        break;
      }

      case UserRole.SUPER_ADMIN:
      case UserRole.AUDITOR:
        // No additional entities needed for these roles
        break;

      default:
        console.warn(`Unknown user role: ${dto.role}`);
        break;
    }
  }

  private async createIspWithSettingsInTransaction(
    dto: CreateUserDto, 
    savedUser: User, 
    manager: EntityManager
  ): Promise<void> {
    try {
      // Create ISP entity with proper data structure
      const ispData = {
        name: dto.fullName, // You might want to add a separate ispName field to dto
        owner: savedUser,
        ownerId: savedUser.id,
        email: savedUser.email,
        phone: savedUser.phone,
        isActive: true,
        // Add other ISP fields as needed
      };
      
      const ispEntity = manager.create(Isp, ispData);
      const savedIsp = await manager.save(Isp, ispEntity);

      // Create ISP settings with proper data structure and fixed typing
      const settingsData = {
        isp: savedIsp,
        enableHotspot: dto.enableHotspot ?? true,
        enablePPPoE: dto.enablePPPoE ?? true,
        require2FA: dto.require2FA ?? false,
        maxConcurrentSessions: 1,
        sessionTimeout: 60,
        enableUsageLogging: true,
        autoSuspendAfterDays: dto.autoSuspendAfterDays || undefined, // Changed from null to undefined
        emailNotificationsEnabled: true,
        smsNotificationsEnabled: false,
        defaultPackageId: dto.defaultBandwidthPackageId || undefined, // Changed from null to undefined
        customPortalUrl: undefined, // Changed from null to undefined
        maintenanceMode: dto.maintenanceMode ?? false,
        maintenanceMessage: dto.maintenanceMessage || undefined, // Changed from null to undefined
      };
      
      const settings = manager.create(IspSettings, settingsData);
      await manager.save(IspSettings, settings);

      // Create ISP branding with default values
      const brandingData = {
        isp: savedIsp,
        companyName: dto.fullName,
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        accentColor: '#28a745',
        backgroundColor: '#ffffff',
        textColor: '#212529',
        enableDarkMode: false,
        showLogoOnLogin: true,
        contactEmail: dto.notificationEmail || dto.email,
      };
      
      const branding = manager.create(IspBranding, brandingData);
      await manager.save(IspBranding, branding);

    } catch (error) {
      console.error('Error creating ISP with settings in transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(`Failed to create ISP configuration: ${errorMessage}`);
    }
  }

  // Legacy method for backward compatibility
  private async createIspWithSettings(dto: CreateUserDto, savedUser: User): Promise<void> {
    return this.userRepo.manager.transaction(async (manager) => {
      await this.createIspWithSettingsInTransaction(dto, savedUser, manager);
    });
  }

  async findAll(filters: {
    role?: UserRole;
    ispId?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    userRole?: string;
  } = {}): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.isp', 'isp');

    // Apply filters
    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }
    
    // Skip ispId filtering for SUPER_ADMIN role
    if (filters.ispId && filters.userRole !== UserRole.SUPER_ADMIN) {
      queryBuilder.andWhere('isp.id = :ispId', { ispId: filters.ispId });
    }
    
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Enforce default pagination if not provided
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    // Apply ordering
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const users = await queryBuilder.getMany();

    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['isp', 'isp.settings', 'isp.branding'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    return this.userRepo.findOne({
      where: { email },
      relations: ['isp', 'isp.settings', 'isp.branding'],
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    if (!phone) {
      throw new BadRequestException('Phone is required');
    }

    return this.userRepo.findOne({
      where: { phone },
      relations: ['isp', 'isp.settings', 'isp.branding'],
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    return await this.userRepo.manager.transaction(async (manager) => {
      // Handle ISP relationship update
      if (dto.ispId !== undefined) {
        if (dto.ispId) {
          const isp = await manager.findOne(Isp, { 
            where: { id: dto.ispId, isActive: true } 
          });
          if (!isp) {
            throw new BadRequestException('Invalid or inactive ISP ID');
          }
          user.isp = isp;
        } else {
          user.isp = undefined; // Allow removing ISP relationship
        }
      }

      // Update user properties, excluding ispId as it's handled above
      const { ispId, ...updateData } = dto;
      Object.assign(user, updateData);

      return manager.save(User, user);
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    // Use transaction for cascading deletes
    await this.userRepo.manager.transaction(async (manager) => {
      await manager.remove(User, user);
    });
  }

  async softDelete(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = false;
    // You might want to add a deletedAt field to your User entity
    return this.userRepo.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.userRepo.save(user);
  }

  async deactivateExpiredUsers(): Promise<{ deactivatedCount: number }> {
    const now = new Date();

    // Use query builder for better performance
    const result = await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({ isActive: false })
      .where('expiryDate <= :now', { now })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();

    return { deactivatedCount: result.affected || 0 };
  }

  async getUsersExpiringSoon(days: number = 7): Promise<User[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.userRepo.find({
      where: {
        expiryDate: Between(now, futureDate),
        isActive: true,
      },
      relations: ['isp'],
      order: { expiryDate: 'ASC' },
    });
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    expired: number;
    byRole: Record<string, number>;
  }> {
    const total = await this.userRepo.count();
    const active = await this.userRepo.count({ where: { isActive: true } });
    const inactive = total - active;
    
    const now = new Date();
    const expired = await this.userRepo.count({
      where: {
        expiryDate: LessThanOrEqual(now),
        isActive: true,
      },
    });

    // Get counts by role
    const roleStats = await this.userRepo
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat.role] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      expired,
      byRole,
    };
  }

  async extendUserExpiry(id: string, days: number): Promise<User> {
    if (days <= 0) {
      throw new BadRequestException('Days must be a positive number');
    }

    const user = await this.findOne(id);
    
    const baseDate = user.expiryDate && user.expiryDate > new Date() 
      ? user.expiryDate 
      : new Date();
    
    user.expiryDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.userRepo.save(user);
  }

  async changeUserRole(id: string, newRole: UserRole): Promise<User> {
    const user = await this.findOne(id);
    const oldRole = user.role;

    if (oldRole === newRole) {
      throw new BadRequestException('User already has this role');
    }

    return await this.userRepo.manager.transaction(async (manager) => {
      // Clean up old role-specific entities if needed
      await this.cleanupRoleSpecificEntities(user, oldRole, manager);

      // Update user role
      user.role = newRole;
      const updatedUser = await manager.save(User, user);

      // Create new role-specific entities if needed
      await this.createRoleSpecificEntityInTransaction(
        { role: newRole } as CreateUserDto, 
        updatedUser, 
        user.isp, 
        manager
      );

      return updatedUser;
    });
  }

  private async cleanupRoleSpecificEntities(
    user: User, 
    oldRole: UserRole, 
    manager: EntityManager
  ): Promise<void> {
    switch (oldRole) {
      case UserRole.ADMIN:
        const admin = await manager.findOne(Admin, { where: { user: { id: user.id } } });
        if (admin) {
          await manager.remove(Admin, admin);
        }
        break;
      case UserRole.CLIENT:
        const client = await manager.findOne(Client, { where: { user: { id: user.id } } });
        if (client) {
          await manager.remove(Client, client);
        }
        break;
      case UserRole.ISP_ADMIN:
        // Note: Be careful with ISP deletion as it might have dependent data
        const isp = await manager.findOne(Isp, { where: { owner: { id: user.id } } });
        if (isp) {
          // You might want to transfer ownership instead of deleting
          console.warn(`Changing role from ISP for user ${user.id}. Consider transferring ISP ownership.`);
        }
        break;
    }
  }

  async getUsersByIsp(ispId: string): Promise<User[]> {
    if (!ispId) {
      throw new BadRequestException('ISP ID is required');
    }

    return this.userRepo.find({
      where: { isp: { id: ispId } },
      relations: ['isp'],
      order: { createdAt: 'DESC' },
    });
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { email, isActive: true },
      relations: ['isp'],
    });

    if (!user) {
      return null;
    }

    // Assuming your User entity has a validatePassword method
    const isValidPassword = await user.validatePassword(password);
    
    return isValidPassword ? user : null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepo.update(userId, {
      // Assuming you have a lastLoginAt field in your User entity
      // lastLoginAt: new Date(),
    });
  }
}