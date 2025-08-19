// sessions/dto/update-session.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { SessionStatus } from '../entities/session.entity';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional()
  @IsEnum(SessionStatus, {
    message: 'status must be one of: active, closed, expired, pending',
  })
  status?: SessionStatus;

  @IsOptional()
  @IsDateString({ strict: true }, { message: 'endedAt must be a valid ISO date string' })
  endedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
