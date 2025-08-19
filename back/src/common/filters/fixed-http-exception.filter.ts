import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class FixedHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(FixedHttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Get the status code from the exception
    const status = exception.getStatus();
    
    // Get the error message and response from the exception
    const errorResponse = exception.getResponse() as any;
    
    // Check if the URL is missing the version prefix and it's a 404 error
    if (status === HttpStatus.NOT_FOUND && 
        request.url.startsWith('/api/') && 
        !request.url.match(/\/api\/v\d+\//)) {
      
      // Extract the path after /api/
      const path = request.url.replace(/^\/api\//, '');
      
      // Check if this is one of our known endpoints that should have versioning
      const knownEndpoints = [
        'users', 'analytics', 'mikrotik', 'payments', 'stats',
        'analytics/revenue-summary', 'analytics/usage-summary',
        'payments/history', 'mikrotik/routers'
      ];
      
      // Check if the requested path starts with any of our known endpoints
      const matchedEndpoint = knownEndpoints.find(endpoint => 
        path.startsWith(endpoint) || 
        path.split('?')[0] === endpoint
      );
      
      if (matchedEndpoint) {
        // Log the versioning issue
        this.logger.warn(
          `⚠️ API versioning issue detected: ${request.method} ${request.url} - Missing version prefix. Try /api/v1/${path} instead.`
        );
        
        // Return a more helpful error message
        return response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message: `Missing API version. Please use /api/v1/${path} instead.`,
          error: 'Version Required',
          suggestedUrl: `/api/v1/${path}${request.url.includes('?') ? request.url.substring(request.url.indexOf('?')) : ''}`,
        });
      }
    }
    
    // For JWT errors, provide more helpful information
    if (status === HttpStatus.UNAUTHORIZED && 
        errorResponse?.message === 'jwt malformed') {
      
      this.logger.error(
        `🔒 Authentication error: ${request.method} ${request.url} - JWT token is malformed or missing`
      );
      
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: 'Authentication failed: Invalid or missing JWT token. Please login again.',
        error: 'Unauthorized',
        details: 'Your session may have expired or the token is invalid. Try logging out and logging in again.',
      });
    }
    
    // Log the exception
    this.logger.error(
      `❌ ${request.method} ${request.url} -> ${JSON.stringify(errorResponse)}`
    );
    
    // Return the standard error response
    return response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorResponse?.message || exception.message,
      error: errorResponse?.error || HttpStatus[status],
    });
  }
}