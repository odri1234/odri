import { Injectable, Logger } from '@nestjs/common';
import * as MikroNode from 'mikronode-ng';

interface ExecuteCommandParams {
  host: string;
  username?: string;
  password?: string;
  command: string[];
  port?: number;
}


@Injectable()
export class MikroTikApiService {
  private readonly logger = new Logger(MikroTikApiService.name);

  async executeCommand(params: ExecuteCommandParams): Promise<any[]> {
    const { host, username, password, command, port = 8728 } = params;

    this.logger.debug(`📡 Connecting to MikroTik at ${host}:${port}`);

    const device = new MikroNode(host, port);
    const conn = device.getConnection(username, password);

    try {
      const [login] = await conn.connect();
      const chan = login.openChannel('command');

      this.logger.debug(`📤 Sending command to MikroTik: ${command.join(' ')}`);
      chan.write(command);

      return await new Promise<any[]>((resolve, reject) => {
        chan.on('done', (data: unknown) => {
          const parsed = MikroNode.resultsToObj(data);
          this.logger.debug(`✅ MikroTik response: ${JSON.stringify(parsed)}`);
          resolve(parsed);
        });

        chan.on('trap', (trapError: unknown) => {
          const message =
            trapError instanceof Error
              ? trapError.message
              : JSON.stringify(trapError);
          this.logger.error(`🚨 MikroTik trap error: ${message}`);
          reject(new Error(`MikroTik trap: ${message}`));
        });

        chan.on('error', (channelError: unknown) => {
          const message =
            channelError instanceof Error
              ? channelError.message
              : JSON.stringify(channelError);
          this.logger.error(`❌ MikroTik channel error: ${message}`);
          reject(new Error(`Channel error: ${message}`));
        });
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`❌ Connection failed to MikroTik [${host}]: ${message}`);
      throw new Error(`Connection failed: ${message}`);
    }
  }
}
