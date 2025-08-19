import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { Isp } from '../../isps/entities/isp.entity';

export const CurrentIsp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Isp | null => {
    const request = ctx.switchToHttp().getRequest();
    const logger = new Logger('CurrentIsp');
    
    if (!request.isp) {
      logger.warn('ISP information not found in request. User: ' + 
        (request.user ? `${request.user.email} (${request.user.role})` : 'Not authenticated'));
    }
    
    return request.isp || null;
  },
);
