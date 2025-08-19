import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/users/constants/user-role.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    // Temporarily allow seeding in all environments
    // TODO: Remove this after initial setup
    const nodeEnv = this.configService.get('NODE_ENV');
    this.logger.log(`Current environment: ${nodeEnv}`);
    
    await this.seedUsers();
  }

  private async seedUsers() {
    this.logger.log('Checking if users need to be seeded...');

    // Check if any users exist
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      this.logger.log(`${userCount} users already exist, skipping seeding`);

      const users = await this.userRepository.find();
      this.logger.log(`Existing users: ${JSON.stringify(users, null, 2)}`);

      return;
    }

    this.logger.log('Seeding initial users...');

    const users = [
      {
        email: 'vickyodri@gmail.com',
        password: '@Vicky17049381',
        fullName: 'victor odhiambo',
        phone: '0728568054',
        role: UserRole.SUPER_ADMIN,
      },
    ];

    for (const userData of users) {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        const user = this.userRepository.create({
          email: userData.email,
          password: hashedPassword,
          fullName: userData.fullName,
          phone: userData.phone,
          role: userData.role,
          isActive: true,
          twoFactorEnabled: false,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.userRepository.save(user);
        this.logger.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`❌ Failed to create user ${userData.email}:`, errorMessage);
      }
    }

    this.logger.log('🎉 User seeding completed!');
  }
}
