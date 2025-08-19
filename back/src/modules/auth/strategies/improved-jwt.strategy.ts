import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImprovedJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(ImprovedJwtStrategy.name);

  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Try to extract from Authorization header first
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Then try from cookie
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['auth_token'];
          }
          return token;
        },
        // Finally try from query parameter (for WebSocket connections)
        (req) => {
          let token = null;
          if (req && req.query && req.query.token) {
            token = req.query.token;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any) {
    // Log successful token validation
    this.logger.debug(`JWT validated for user: ${payload.sub}`);
    
    // Return the payload which will be attached to the request as req.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      ispId: payload.ispId,
    };
  }
}