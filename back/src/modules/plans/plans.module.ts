import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { PlanPricing } from './entities/plan-pricing.entity';
import { DynamicPricing } from './entities/dynamic-pricing.entity';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, PlanPricing, DynamicPricing])],
  providers: [PlansService],
  controllers: [PlansController],
  exports: [
    PlansService,
    TypeOrmModule,
  ],
})
export class PlansModule {}
