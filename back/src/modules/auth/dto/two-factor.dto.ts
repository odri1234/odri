// auth/dto/two-factor.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class TwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'The 6-digit verification code from your authenticator app',
  })
  @IsString()
  @IsNotEmpty({ message: 'Two-factor authentication token is required' })
  @Length(6, 6, { message: 'Token must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'Token must contain only numbers' })
  token: string;
}
