import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ description: 'Name of the plan', example: 'Basic Internet Plan' })
  @IsString()
  @MaxLength(100)
  name!: string; // ✅ definite assignment

  @ApiProperty({ description: 'Description of the plan', example: 'This plan offers 10Mbps unlimited internet' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Price of the plan in the smallest currency unit (e.g., cents)', example: 1000 })
  @IsNumber()
  @Min(0)
  price!: number; // ✅ definite assignment

  @ApiProperty({ description: 'Data quota in MB, 0 for unlimited', example: 10240 })
  @IsNumber()
  @Min(0)
  dataQuota!: number; // ✅ definite assignment

  @ApiProperty({ description: 'Speed limit in Kbps', example: 10240 })
  @IsNumber()
  @Min(0)
  speedLimit!: number; // ✅ definite assignment

  @ApiProperty({ description: 'Is the plan active or not', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
