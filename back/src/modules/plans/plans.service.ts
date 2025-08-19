import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plan } from './entities/plan.entity';
import { PlanPricing } from './entities/plan-pricing.entity';
import { DynamicPricing } from './entities/dynamic-pricing.entity';

import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,

    @InjectRepository(PlanPricing)
    private readonly planPricingRepository: Repository<PlanPricing>,

    @InjectRepository(DynamicPricing)
    private readonly dynamicPricingRepository: Repository<DynamicPricing>,
  ) {}

  async createPlan(createPlanDto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepository.create(createPlanDto);
    return await this.planRepository.save(plan);
  }

  async getAllPlans(): Promise<Plan[]> {
    return this.planRepository.find({
      relations: ['pricings', 'dynamicPricings'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPlanById(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['pricings', 'dynamicPricings'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID '${id}' not found.`);
    }

    return plan;
  }

  async updatePlan(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.getPlanById(id);
    Object.assign(plan, updatePlanDto);
    return await this.planRepository.save(plan);
  }

  async deletePlan(id: string): Promise<{ message: string }> {
    const result = await this.planRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Plan with ID '${id}' not found.`);
    }
    return { message: `Plan with ID '${id}' deleted successfully.` };
  }

  async addPricingToPlan(
    planId: string,
    pricingData: Partial<PlanPricing>,
  ): Promise<PlanPricing> {
    const plan = await this.getPlanById(planId);
    const pricing = this.planPricingRepository.create({
      ...pricingData,
      plan,
    });
    return await this.planPricingRepository.save(pricing);
  }

  async addDynamicPricing(
    planId: string,
    dynamicPricingData: Partial<DynamicPricing>,
  ): Promise<DynamicPricing> {
    const plan = await this.getPlanById(planId);
    const dynamicPricing = this.dynamicPricingRepository.create({
      ...dynamicPricingData,
      plan,
    });
    return await this.dynamicPricingRepository.save(dynamicPricing);
  }
}
