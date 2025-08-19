// plans/dto/update-plan.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
