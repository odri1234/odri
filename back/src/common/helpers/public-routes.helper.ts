import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PublicRoutesHelper {
  private readonly logger = new Logger(PublicRoutesHelper.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Logs all routes marked as public for debugging purposes
   */
  logPublicRoutes(): void {
    const controllers = this.discoveryService.getControllers();
    const publicRoutes: string[] = [];

    controllers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance) return;

      const controllerClass = instance.constructor;
      const controllerPath = Reflect.getMetadata('path', controllerClass) || '';
      
      // Check if the entire controller is public
      const isControllerPublic = this.reflector.get<boolean>(
        IS_PUBLIC_KEY,
        controllerClass,
      );

      if (isControllerPublic) {
        publicRoutes.push(`${controllerPath}/* (entire controller)`);
        return;
      }

      // Check individual routes
      const prototype = Object.getPrototypeOf(instance);
      this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        (methodName: string) => {
          const handler = prototype[methodName];
          const isPublic = this.reflector.get<boolean>(
            IS_PUBLIC_KEY,
            handler,
          );

          if (isPublic) {
            const methodPath = Reflect.getMetadata('path', handler) || '';
            const httpMethod = Reflect.getMetadata('method', handler) || 'GET';
            
            publicRoutes.push(
              `${httpMethod} /${controllerPath}${
                methodPath ? `/${methodPath}` : ''
              }`,
            );
          }
        },
      );
    });

    if (publicRoutes.length > 0) {
      this.logger.log('🔓 Public routes (not protected by JWT):', publicRoutes);
    } else {
      this.logger.log('No public routes found');
    }
  }
}