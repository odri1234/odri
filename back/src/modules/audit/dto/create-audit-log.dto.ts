import { IsUUID, IsString, IsEnum, IsOptional } from 'class-validator';
import { LogAction } from '../enums/log-action.enum';

export class CreateAuditLogDto {
  @IsUUID()
  userId: string;

  @IsString()
  username: string;

  @IsEnum(LogAction)
  action: LogAction;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
