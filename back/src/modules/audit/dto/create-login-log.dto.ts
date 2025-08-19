import { IsUUID, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateLoginLogDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
