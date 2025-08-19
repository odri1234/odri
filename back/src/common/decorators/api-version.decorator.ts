import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to tag controller routes with a specific API version.
 * Useful for routing, documentation, and backward compatibility.
 */
export const API_VERSION_KEY = 'apiVersion';

/**
 * Usage:
 * @ApiVersion('v1')
 */
export const ApiVersion = (version: string): ReturnType<typeof SetMetadata> =>
  SetMetadata(API_VERSION_KEY, version);
