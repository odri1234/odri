import {
  Version, Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { MetricType } from './metric-type.enum'; // Ensure enum is in shared file

@Controller('metrics')
export class MetricsController {
  constructor(private readonly svc: MetricsService) {}

  @Post()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() dto: CreateMetricDto) {
    return this.svc.create(dto);
  }

  @Get('summary/:ispId')
  getSummary(
    @Param('ispId', new ParseUUIDPipe()) ispId: string,
    @Query('type') type: MetricType,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    // You can add more validation (e.g. check that dates are present)
    return this.svc.getSummary(ispId, type, start, end);
  }
}
