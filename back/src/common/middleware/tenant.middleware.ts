import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, res: Response, next: NextFunction) {
    // Try 1: Extract from header
    let tenantId = req.headers['x-tenant-id'] as string;

    // Try 2: Extract from query string
    if (!tenantId && req.query.tenantId) {
      tenantId = req.query.tenantId as string;
    }

    // Try 3: Extract from subdomain (e.g. tenant1.example.com)
    if (!tenantId) {
      const host = req.hostname; // example: tenant1.example.com
      const parts = host.split('.');
      if (parts.length > 2) {
        tenantId = parts[0]; // assumes subdomain is the tenant ID
      }
    }

    if (!tenantId) {
      throw new UnauthorizedException('Tenant identifier missing in request');
    }

    req.tenantId = tenantId;
    next();
  }
}
