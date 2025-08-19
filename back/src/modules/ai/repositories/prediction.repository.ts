import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from '../entities/prediction.entity';

@Injectable()
export class PredictionRepository {
  constructor(
    @InjectRepository(Prediction)
    private readonly repo: Repository<Prediction>,
  ) {}

  async findByModelId(modelId: string): Promise<Prediction[]> {
    return this.repo
      .createQueryBuilder('prediction')
      .leftJoinAndSelect('prediction.model', 'model')
      .where('model.id = :modelId', { modelId })
      .getMany();
  }

  async findWithModel(id: string): Promise<Prediction | null> {
    return this.repo
      .createQueryBuilder('prediction')
      .leftJoinAndSelect('prediction.model', 'model')
      .where('prediction.id = :id', { id })
      .getOne();
  }

  async createPrediction(data: Partial<Prediction>): Promise<Prediction> {
    const prediction = this.repo.create(data);
    return this.repo.save(prediction);
  }
}
