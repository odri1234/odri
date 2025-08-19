// src/modules/mikrotik/dto/user-profile.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsBooleanString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username of the Hotspot or PPPoE user',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: '5M/5M',
    description: 'Download/Upload limit (e.g., 5M/5M)',
    required: false,
  })
  @IsOptional()
  @IsString()
  rateLimit?: string;

  @ApiProperty({
    example: 'VIP Users',
    description: 'User profile name to assign',
    required: false,
  })
  @IsOptional()
  @IsString()
  profile?: string;

  @ApiProperty({
    example: 'true',
    description: 'Whether to disable the user temporarily ("true" or "false")',
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  disabled?: string;
}
