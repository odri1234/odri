import { IsUUID, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { MetricType } from '../metric-type.enum'; // Moved MetricType to a shared enum file

export class CreateMetricDto {
  @IsUUID()
  ispId!: string;

  @IsEnum(MetricType, { message: 'type must be either REVENUE or USAGE' })
  type!: MetricType;

  @IsNumber({}, { message: 'value must be a number' })
  value!: number;

  @IsDateString({}, { message: 'timestamp must be a valid ISO date string' })
  timestamp!: string;
}
