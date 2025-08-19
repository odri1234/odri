import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiVersionMiddleware.name);
  private readonly apiPrefix = 'api';
  private readonly defaultVersion = 'v1';
  
  // List of endpoints that should have versioning
  private readonly versionedEndpoints = [
    'users', 'analytics', 'mikrotik', 'payments', 'stats',
    'analytics/revenue-summary', 'analytics/usage-summary',
    'payments/history', 'mikrotik/routers'
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const originalUrl = req.originalUrl;
    
    // Skip if not starting with our API prefix
    if (!originalUrl.startsWith(`/${this.apiPrefix}/`)) {
      return next();
    }
    
    // Skip if already has version
    if (originalUrl.match(new RegExp(`/${this.apiPrefix}/v\\d+/`))) {
      return next();
    }
    
    // Extract path after /api/
    const path = originalUrl.replace(new RegExp(`^/${this.apiPrefix}/`), '');
    const pathWithoutQuery = path.split('?')[0];
    
    // Check if this path should be versioned
    const shouldVersion = this.versionedEndpoints.some(endpoint => 
      pathWithoutQuery === endpoint || pathWithoutQuery.startsWith(`${endpoint}/`)
    );
    
    if (shouldVersion) {
      // Construct new URL with version
      const queryString = originalUrl.includes('?') 
        ? originalUrl.substring(originalUrl.indexOf('?')) 
        : '';
        
      const newUrl = `/${this.apiPrefix}/${this.defaultVersion}/${path}`;
      
      this.logger.log(`Redirecting ${originalUrl} to ${newUrl}`);
      
      // Redirect to versioned URL
      return res.redirect(307, newUrl);
    }
    
    next();
  }
}