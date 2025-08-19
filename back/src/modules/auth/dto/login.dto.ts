// auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address used to login',
  })
  @IsEmail({}, { message: 'A valid email is required' })
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'User account password',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  // Optional: Future proofing for OTP login or CAPTCHA
  @ApiProperty({
    example: '123456',
    required: false,
    description: 'One-time password if two-factor is required',
  })
  otpCode?: string;

  @ApiProperty({
    example: '03AGdBq24bRf...reCAPTCHA-token...',
    required: false,
    description: 'Optional reCAPTCHA token for bot protection',
  })
  captchaToken?: string;
}
