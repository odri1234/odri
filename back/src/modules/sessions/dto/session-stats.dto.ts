// sessions/dto/session-stats.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SessionStatsDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  totalBytesIn!: number;

  @ApiProperty()
  totalBytesOut!: number;

  @ApiProperty()
  startTime!: Date;

  @ApiProperty({ nullable: true })
  endTime!: Date | null;
}
