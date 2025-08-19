// auth/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Your current password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Old password is required' })
  oldPassword: string;

  @ApiProperty({
    example: 'NewStrongPass#2024',
    description: 'New password (at least 8 characters, including letters and numbers)',
  })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/, {
    message:
      'New password must contain at least one letter and one number',
  })
  newPassword: string;

  @ApiProperty({
    example: 'NewStrongPass#2024',
    description: 'Confirm new password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;
}
