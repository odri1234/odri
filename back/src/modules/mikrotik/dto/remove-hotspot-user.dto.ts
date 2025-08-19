import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveHotspotUserDto {
  @ApiProperty({
    example: 'router-xyz123',
    description: 'ID of the router from which the user should be removed',
  })
  @IsString({ message: 'routerId must be a string' })
  @IsNotEmpty({ message: 'routerId is required' })
  routerId!: string;

  @ApiProperty({
    example: 'john_doe123',
    description: 'Username of the Hotspot user to remove from MikroTik',
    maxLength: 64,
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MaxLength(64, { message: 'Username must be at most 64 characters' })
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Username can only contain letters, numbers, dots, underscores, and hyphens',
  })
  username!: string;
}
