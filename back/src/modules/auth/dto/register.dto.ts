// auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsEnum,
  IsUUID,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
// Import the actual UserRole enum from constants
import { UserRole } from '../../users/constants/user-role.constants';
import { MatchPasswordsConstraint } from '../../common/validators/match-passwords.validator';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must be under 100 characters' })
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value, obj }) => {
    // Auto-generate name from firstName and lastName if name is not provided
    if (!value && obj.firstName && obj.lastName) {
      return `${obj.firstName.trim()} ${obj.lastName.trim()}`;
    }
    return value;
  })
  name: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MaxLength(50, { message: 'First name must be under 50 characters' })
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(50, { message: 'Last name must be under 50 characters' })
  lastName?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Valid email address for the account',
  })
  @IsEmail({}, { message: 'A valid email is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'Odri@2024',
    description:
      'Password for the account (min 8 characters, must include uppercase, lowercase, number and special character)',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]).{8,}$/,
    {
      message:
        'Password must include uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  @ApiProperty({
    example: 'Odri@2024',
    description: 'Confirm password (must match password)',
  })
  @IsString({ message: 'confirmPassword must be a string' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @Validate(MatchPasswordsConstraint)
  confirmPassword: string;

  @ApiProperty({
    example: '07XXXXXXXX',
    description: 'Phone number (must start with 07 or 01 and be 10 digits)',
    required: false,
  })
  @IsOptional()
  @Matches(/^0(7|1)\d{8}$/, {
    message: 'Phone must start with 07 or 01 and be 10 digits',
  })
  phone?: string;

  @ApiProperty({
    example: UserRole.CLIENT,
    description: 'User role in the system',
    enum: UserRole,
    required: false,
    default: UserRole.CLIENT,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Tenant ID for multi-tenant applications',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'Tenant ID must be a valid UUID' })
  tenantId?: string;

  @ApiProperty({
    example: '03AGdBq24bRf...reCAPTCHA-token...',
    required: false,
    description: 'Optional reCAPTCHA token for spam/bot protection',
  })
  @IsOptional()
  @IsString()
  captchaToken?: string;
}