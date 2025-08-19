import { IsOptional, IsString, IsBoolean, IsNumber, IsUrl } from 'class-validator';

export class IspSettingsDto {
  @IsOptional()
  @IsBoolean()
  enableHotspot?: boolean;

  @IsOptional()
  @IsBoolean()
  enablePPPoE?: boolean;

  @IsOptional()
  @IsBoolean()
  enableVouchers?: boolean;

  @IsOptional()
  @IsString()
  defaultUserRole?: string;

  @IsOptional()
  @IsNumber()
  defaultValidityDays?: number;

  @IsOptional()
  @IsUrl()
  termsOfServiceUrl?: string;

  @IsOptional()
  @IsString()
  brandingColor?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  autoApproveUsers?: boolean;
}
