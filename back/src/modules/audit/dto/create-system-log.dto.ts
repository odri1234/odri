import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LogLevel } from '../entities/system-log.entity';

export class CreateSystemLogDto {
  @IsEnum(LogLevel)
  level: LogLevel;

  @IsString()
  source: string;

  @IsString()
  message: string;

  @IsOptional()
  meta?: Record<string, any>;
}
