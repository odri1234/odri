// src/modules/mikrotik/dto/create-hotspot-user.dto.ts

import { IsString, IsOptional, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHotspotUserDto {
  @ApiProperty({
    example: 'router-abc123',
    description: 'ID of the router where the user will be added',
  })
  @IsString()
  @IsNotEmpty()
  routerId!: string;

  @ApiProperty({
    example: 'john_doe123',
    description: 'Username for the Hotspot user',
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Username can only contain letters, numbers, dots, underscores, and hyphens',
  })
  username!: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Password for the Hotspot user',
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  password!: string;

  @ApiProperty({
    example: 'default',
    description: 'Optional Hotspot profile name',
    required: false,
  })
  @IsOptional()
  @IsString()
  profile?: string;

  @ApiProperty({
    example: 'hotspot1',
    description: 'Optional Hotspot server name',
    required: false,
  })
  @IsOptional()
  @IsString()
  server?: string;
}
