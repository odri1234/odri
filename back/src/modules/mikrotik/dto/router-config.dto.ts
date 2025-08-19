// src/modules/mikrotik/dto/router-config.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsIP, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RouterConfigDto {
  @ApiProperty({
    example: 'Main Office Router',
    description: 'Name/label for the router',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: '192.168.88.1',
    description: 'IP address of the MikroTik router',
  })
  @IsIP()
  @IsNotEmpty()
  ipAddress!: string;

  @ApiProperty({
    example: 8728,
    description: 'API port of the MikroTik router (default: 8728)',
    default: 8728,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  apiPort?: number = 8728;

  @ApiProperty({
    example: 'admin',
    description: 'Username to access MikroTik router',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: 'securepassword123',
    description: 'Password for the MikroTik router',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    example: 'Main office, Building A',
    description: 'Physical location of the router',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 'Primary router for hotspot service',
    description: 'Description of the router',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the router is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
