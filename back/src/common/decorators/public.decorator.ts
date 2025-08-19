// src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to mark routes as public (i.e., not protected by guards like JwtAuthGuard).
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route or controller as public (unguarded).
 *
 * Example:
 * 
 * @Public()
 * @Get('login')
 * login() {
 *   return 'Login endpoint';
 * }
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
