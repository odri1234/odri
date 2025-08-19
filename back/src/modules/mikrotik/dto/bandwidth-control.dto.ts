// src/modules/mikrotik/dto/bandwidth-control.dto.ts

import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BandwidthControlDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username of the Hotspot or PPPoE user',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: '5M/5M',
    description: 'New target bandwidth in format upload/download (e.g., 5M/5M)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+[kKmMgG]?\/\d+[kKmMgG]?$/, {
    message: 'target must be in format like 5M/5M, 512k/1M, etc.',
  })
  target!: string;

  @ApiProperty({
    example: 'default',
    description: 'Optional queue name to assign the limit',
    required: false,
  })
  @IsOptional()
  @IsString()
  queueName?: string;
}
