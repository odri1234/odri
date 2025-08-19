import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum ScheduleType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export class BackupScheduleDto {
  @IsEnum(ScheduleType)
  @IsNotEmpty()
  type: ScheduleType;

  @IsString()
  @IsNotEmpty()
  cronExpression: string; // e.g., '0 2 * * *' for 2:00 AM daily

  @IsString()
  @IsOptional()
  notes?: string;
}
