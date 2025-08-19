import {
  Version, Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/constants/user-role.constants';  // <-- fixed import path
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'List of plans retrieved successfully' })
  async findAll() {
    return this.plansService.getAllPlans();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get a plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.createPlan(createPlanDto);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  @ApiOperation({ summary: 'Update a plan' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.updatePlan(id, updatePlanDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a plan' })
  @ApiResponse({ status: 204, description: 'Plan deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.plansService.deletePlan(id);
  }
}
