// C:\Users\ADMN\odri\back\src\modules\auth\auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { ImprovedJwtStrategy } from './strategies/improved-jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';

import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ImprovedJwtStrategy, // <-- Add the improved strategy
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
    RateLimitGuard,
    // Removed global JwtAuthGuard registration to avoid conflicts
    {
      provide: 'ROLES_GUARD',
      useClass: RolesGuard,
    },
    {
      provide: 'RATE_LIMIT_GUARD',
      useClass: RateLimitGuard,
    },
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtStrategy,
    ImprovedJwtStrategy, // <-- Export the improved strategy
    LocalStrategy,
    JwtAuthGuard,
    RolesGuard,
    RateLimitGuard,
  ],
})
export class AuthModule {}
