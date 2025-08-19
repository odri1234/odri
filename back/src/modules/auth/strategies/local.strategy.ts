// src/modules/auth/strategies/local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // expect email instead of username
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Partial<User>> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Optionally add rate-limiting detection logic here (e.g., brute force protection)

    this.logger.log(`User validated: ${user.email}`);

    // Return only safe fields
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
