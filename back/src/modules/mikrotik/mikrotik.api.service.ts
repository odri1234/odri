import { Injectable, Logger } from '@nestjs/common';
import { Router } from './entities/router.entity';

@Injectable()
export class MikroTikApiService {
  private readonly logger = new Logger(MikroTikApiService.name);

  async executeCommand(commands: string[]): Promise<any[]> {
    // Implement MikroTik API connection logic
    this.logger.log(`Executing commands: ${commands.join(', ')}`);
    return [];
  }
}