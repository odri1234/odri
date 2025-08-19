import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use = (req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Disable content-type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Strict transport security (Only if HTTPS is enforced)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';",
    );

    // Referrer policy
    res.setHeader('Referrer-Policy', 'no-referrer');

    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );

    next();
  };
}
