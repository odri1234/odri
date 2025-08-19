import { IsArray, IsString, IsOptional } from 'class-validator';

export class BackupConfigDto {
  @IsArray()
  @IsString({ each: true })
  directories: string[];

  @IsString()
  destination: string;

  @IsOptional()
  @IsString()
  name?: string;
}
