import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Isp } from '../../modules/isps/entities/isp.entity';

@Injectable()
export class IspResolverMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IspResolverMiddleware.name);

  constructor(
    @InjectRepository(Isp)
    private readonly ispRepository: Repository<Isp>,
  ) {}

  async use(req: Request & { user?: any; isp?: Isp }, res: Response, next: NextFunction) {
    // Skip if no user is authenticated
    if (!req.user) {
      return next();
    }

    try {
      // For SUPER_ADMIN users, we don't need to set an ISP
      if (req.user.role === 'SUPER_ADMIN') {
        this.logger.debug(`SUPER_ADMIN user ${req.user.email} - no ISP needed`);
        return next();
      }

      // If user has an ispId, load the ISP
      if (req.user.ispId) {
        const isp = await this.ispRepository.findOne({
          where: { id: req.user.ispId },
        });

        if (isp) {
          req.isp = isp;
          this.logger.debug(`ISP resolved for user ${req.user.email}: ${isp.name}`);
        } else {
          this.logger.warn(`ISP with ID ${req.user.ispId} not found for user ${req.user.email}`);
        }
      } else {
        this.logger.warn(`No ISP ID found for user ${req.user.email}`);
      }
    } catch (error) {
      // Handle the error properly with type checking
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      this.logger.error(`Error resolving ISP: ${errorMessage}`);
    }

    next();
  }
}