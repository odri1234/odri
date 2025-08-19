import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MikrotikConfigService {
  constructor(private readonly configService: ConfigService) {}

  getDefaultUsername(): string {
    return this.configService.get('MIKROTIK_DEFAULT_USERNAME') || 'admin';
  }

  getDefaultPassword(): string {
    return this.configService.get('MIKROTIK_DEFAULT_PASSWORD') || '';
  }

  getDefaultPort(): number {
    return parseInt(this.configService.get('MIKROTIK_DEFAULT_PORT') || '8728');
  }
}
