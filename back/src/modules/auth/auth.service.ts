import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/constants/user-role.constants';
import { SafeUserDto as SafeUser } from './dto/safe-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'fullName',
        'phone',
        'password',
        'role',
        'isActive',
        'twoFactorEnabled',
      ],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid =
      typeof user.validatePassword === 'function'
        ? await user.validatePassword(password)
        : await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Invalid login attempt for email: ${email}`);
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // ✅ Construct SafeUser explicitly to match SafeUserDto
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? '', // fallback to empty string to satisfy type
      role: user.role,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    return safeUser;
  }

  async login(user: SafeUser) {
    const fullUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['isp'],
    });

    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    const requestId = uuidv4();
    const payload = {
      sub: fullUser.id,
      email: fullUser.email,
      role: fullUser.role,
      ispId: fullUser.isp?.id ?? null, // null is acceptable for SUPER_ADMIN users
      requestId,
    };

    if (fullUser.twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        tempToken: this.jwtService.sign(payload, { expiresIn: '5m' }),
      };
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '24h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    await this.userRepository.update(fullUser.id, { lastLogin: new Date() });

    return {
      user: {
        id: fullUser.id,
        email: fullUser.email,
        fullName: fullUser.fullName,
        phone: fullUser.phone,
        role: fullUser.role,
        isActive: fullUser.isActive,
        twoFactorEnabled: fullUser.twoFactorEnabled,
        isp: fullUser.isp
          ? {
              id: fullUser.isp.id,
              name: fullUser.isp.name,
            }
          : null,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
      tenant: fullUser.isp // alias isp as tenant if the frontend expects it
        ? {
            id: fullUser.isp.id,
            name: fullUser.isp.name,
          }
        : null,
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      // Validate password confirmation
      if (registerDto.password !== registerDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);

      // Map RegisterDto to User entity fields
      const userData: Partial<User> = {
        email: registerDto.email,
        password: hashedPassword,
        fullName: registerDto.name, // Map 'name' to 'fullName' for the entity
        phone: registerDto.phone || undefined,
        role: registerDto.role || UserRole.CLIENT, // Default to CLIENT
        isActive: true,
        twoFactorEnabled: false,
        emailVerified: false, // Assuming you have email verification
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add tenant support if provided
      if (registerDto.tenantId) {
        userData.tenantId = registerDto.tenantId;
      }

      // Create and save the user
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);

      this.logger.log(`New user registered: ${savedUser.email} (ID: ${savedUser.id})`);

      // Return sanitized user data (exclude sensitive fields)
      const { password, resetToken, resetTokenExpiry, twoFactorSecret, ...sanitizedUser } = savedUser;
      
      return {
        data: {
          user: sanitizedUser,
          message: 'Registration successful',
        }
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // Re-throw validation errors
      }
      
      this.logError('Registration failed', error);
      
      // Handle specific database errors
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { 
        // PostgreSQL unique constraint violation
        throw new BadRequestException('User with this email already exists');
      }
      
      throw new InternalServerErrorException('User registration failed. Please try again.');
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if email exists or not for security
        return { message: 'If the email exists, a reset link has been sent' };
      }

      const resetToken = this.jwtService.sign(
        { userId: user.id, email: user.email },
        { expiresIn: '1h' },
      );

      await this.userRepository.update(user.id, {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
      });

      // TODO: Send resetToken via email provider
      this.logger.log(`Password reset requested for user: ${email}`);

      return { message: 'Reset link sent to email' };
    } catch (error) {
      this.logError('Forgot password failed', error);
      throw new InternalServerErrorException('Unable to process password reset request');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      this.logError('Token verification failed', error);
      throw new BadRequestException('Invalid or expired reset token');
    }

    try {
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId, resetToken: token },
      });

      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Hash new password with higher salt rounds for security
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user with new password and clear reset tokens
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      });

      this.logger.log(`Password reset successful for user: ${user.email}`);

      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logError('Reset password failed', error);
      throw new InternalServerErrorException('Could not reset password');
    }
  }

  async enableTwoFactor(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new BadRequestException('User not found');

      const secret = speakeasy.generateSecret({
        name: `ODRI WiFi (${user.email})`,
        issuer: this.configService.get<string>('APP_NAME') ?? 'ODRI WiFi System',
      });

      if (!secret.otpauth_url) {
        throw new InternalServerErrorException('Failed to generate OTP auth URL');
      }

      await this.userRepository.update(userId, {
        twoFactorSecret: secret.base32,
        updatedAt: new Date(),
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode,
      };
    } catch (error) {
      this.logError('Enable 2FA failed', error);
      throw new InternalServerErrorException('2FA setup failed');
    }
  }

  async verifyTwoFactor(userId: string, token: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.twoFactorSecret) {
        throw new BadRequestException('2FA not set up');
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        throw new UnauthorizedException('Invalid two-factor token');
      }

      await this.userRepository.update(userId, {
        twoFactorEnabled: true,
        updatedAt: new Date(),
      });

      return { message: 'Two-factor authentication enabled' };
    } catch (error) {
      this.logError('2FA verification failed', error);
      throw new InternalServerErrorException('2FA verification failed');
    }
  }

  async logout(userId: string) {
    // TODO: Implement token blacklist or session invalidation here if needed
    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['isp'],
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        ispId: user.isp?.id ?? null, // null is acceptable for SUPER_ADMIN users
        requestId: uuidv4(),
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '24h',
      });

      return {
        data: {
          tokens: {
            accessToken: accessToken,
          },
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            twoFactorEnabled: user.twoFactorEnabled,
            isp: user.isp
              ? {
                  id: user.isp.id,
                  name: user.isp.name,
                }
              : null,
          },
        },
      };
    } catch (error) {
      this.logError('Token refresh failed', error);
      throw new InternalServerErrorException('Token refresh failed');
    }
  }

  async refreshTokenWithRefreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['isp'],
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        ispId: user.isp?.id ?? null,
        requestId: uuidv4(),
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '24h',
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
      });

      return {
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            twoFactorEnabled: user.twoFactorEnabled,
            isp: user.isp
              ? {
                  id: user.isp.id,
                  name: user.isp.name,
                }
              : null,
          },
          tenant: user.isp
            ? {
                id: user.isp.id,
                name: user.isp.name,
              }
            : null,
        },
      };
    } catch (error) {
      this.logError('Refresh token validation failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private logError(context: string, error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(`${context}: ${error.message}`, error.stack);
    } else {
      this.logger.error(`${context}: ${String(error)}`);
    }
  }
}