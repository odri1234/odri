import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
  IsBoolean,
  IsInt,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../constants/user-role.constants';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ description: 'User phone number', example: '0712345678', required: false })
  @IsOptional()
  @IsPhoneNumber('KE')
  phone?: string;

  @ApiProperty({ description: 'User password', example: 'strongpassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.CLIENT })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    description: 'Required if the role is CLIENT.',
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    required: false,
  })
  @ValidateIf((o) => o.role === UserRole.CLIENT)
  @IsNotEmpty()
  @IsString()
  ispId?: string;

  @ApiProperty({ description: 'Is user active', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Account expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  // ✅ Optional ISP Settings

  @ApiProperty({ description: 'Enable hotspot for ISP', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  enableHotspot?: boolean;

  @ApiProperty({ description: 'Enable PPPoE for ISP', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  enablePPPoE?: boolean;

  @ApiProperty({ description: 'Require 2FA for ISP', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  require2FA?: boolean;

  @ApiProperty({ description: 'Auto-generate vouchers', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  autoGenerateVouchers?: boolean;

  @ApiProperty({ description: 'Voucher expiry in days', default: 30, required: false })
  @IsOptional()
  @IsInt()
  voucherExpiryDays?: number;

  @ApiProperty({ description: 'Maximum number of users allowed', default: 100, required: false })
  @IsOptional()
  @IsInt()
  maxUsers?: number;

  @ApiProperty({ description: 'Default bandwidth package ID', required: false, type: 'string', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  defaultBandwidthPackageId?: string;

  @ApiProperty({ description: 'Notification email', required: false })
  @IsOptional()
  @IsEmail()
  notificationEmail?: string;

  @ApiProperty({ description: 'Enable maintenance mode', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @ApiProperty({ description: 'Maintenance message (if maintenance mode is on)', required: false })
  @IsOptional()
  @IsString()
  maintenanceMessage?: string;

  @ApiProperty({ description: 'Auto suspend account after X days of inactivity', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  autoSuspendAfterDays?: number;

  // ✅ NEW: Optional CAPTCHA Token for production
  @ApiProperty({
    example: '03AGdBq24bRf...reCAPTCHA-token...',
    description: 'Optional reCAPTCHA token for spam/bot protection',
    required: false,
  })
  @IsOptional()
  @IsString()
  captchaToken?: string;
}
