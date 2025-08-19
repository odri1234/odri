import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Repositories
import { PlanRepository } from '../plans/repositories/plan.repository';
import { PredictionRepository } from '../ai/repositories/prediction.repository';
import { AnomalyRepository } from '../ai/repositories/anomaly.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanRepository,
      PredictionRepository,
      AnomalyRepository,
    ]),
  ],
  providers: [
    PlanRepository,
    PredictionRepository,
    AnomalyRepository,
  ],
  exports: [
    PlanRepository,
    PredictionRepository,
    AnomalyRepository,
  ],
})
export class RepositoriesModule {}
