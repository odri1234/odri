import { PartialType } from '@nestjs/mapped-types';
import { CreateIspDto } from './create-isp.dto';
import { IsOptional, IsString, IsUrl, IsBoolean, IsEmail } from 'class-validator';

export class UpdateIspDto extends PartialType(CreateIspDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
