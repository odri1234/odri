// C:\Users\ADMN\odri\back\src\modules\auth\strategies\jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/constants/user-role.constants';

interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
  ispId: string | null; // Can be null for SUPER_ADMIN users
  requestId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['isp'], // Include ISP relation
    });

    if (!user) {
      this.logger.warn(`JWT validation failed: user ID ${payload.sub} not found`);
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      this.logger.warn(`Inactive user (${user.email}) tried to log in`);
      throw new UnauthorizedException('Account is inactive');
    }

    // Multi-ISP validation - Skip for SUPER_ADMIN users
    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!user.isp || user.isp.id !== payload.ispId) {
        this.logger.warn(
          `ISP mismatch: Token ISP ${payload.ispId} ≠ DB ISP ${user.isp?.id} (user: ${user.email})`,
        );
        throw new UnauthorizedException('Unauthorized ISP access');
      }
    } else {
      // For SUPER_ADMIN users, log the ISP mismatch as a warning but don't block access
      if (payload.ispId !== null && (!user.isp || user.isp.id !== payload.ispId)) {
        this.logger.warn(
          `ISP mismatch: Token ISP ${payload.ispId} ≠ DB ISP ${user.isp?.id} (user: ${user.email})`,
        );
      }
    }

    // Sanitize user before returning
    const { password, resetToken, resetTokenExpiry, twoFactorSecret, ...safeUser } = user;

    return {
      ...safeUser,
      requestId: payload.requestId || null,
    };
  }
}
