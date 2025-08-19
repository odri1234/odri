import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';

@Injectable()
export class PlanRepository {
  constructor(
    @InjectRepository(Plan)
    private readonly repo: Repository<Plan>,
  ) {}

  async findAll(): Promise<Plan[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Plan | null> {
    return this.repo.findOne({ where: { id } });
  }

  async createPlan(data: Partial<Plan>): Promise<Plan> {
    const plan = this.repo.create(data);
    return this.repo.save(plan);
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async deletePlan(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
