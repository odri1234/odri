import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class RestoreDto {
  @IsUUID()
  @IsNotEmpty()
  backupId: string;

  @IsString()
  @IsOptional()
  targetDirectory?: string;

  @IsString()
  @IsOptional()
  restoreNotes?: string;
}
