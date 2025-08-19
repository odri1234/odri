import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Version,
} from '@nestjs/common';
import { IspsService } from './isps.service';
import { CreateIspDto } from './dto/create-isp.dto';
import { UpdateIspDto } from './dto/update-isp.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/constants/user-role.constants';  // <-- Fixed import path here

import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('ISPs')
@ApiBearerAuth()
@Controller('isps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IspsController {
  constructor(private readonly ispsService: IspsService) {}

  /**
   * Create a new ISP
   * Only accessible to SUPER_ADMIN
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new ISP' })
  create(@Body() createIspDto: CreateIspDto) {
    return this.ispsService.create(createIspDto);
  }

  /**
   * Get all ISPs
   * Only accessible to SUPER_ADMIN
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all ISPs' })
  findAll() {
    return this.ispsService.findAll();
  }

  /**
   * Get a single ISP by ID
   * Accessible to SUPER_ADMIN and ISP ADMINs
   */
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get ISP by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ISP ID (UUID)' })
  findOne(@Param('id') id: string) {
    return this.ispsService.findOne(id);
  }

  /**
   * Update an ISP by ID
   * Only accessible to SUPER_ADMIN
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update ISP by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ISP ID (UUID)' })
  update(@Param('id') id: string, @Body() updateIspDto: UpdateIspDto) {
    return this.ispsService.update(id, updateIspDto);
  }

  /**
   * Delete an ISP by ID
   * Only accessible to SUPER_ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete ISP by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ISP ID (UUID)' })
  remove(@Param('id') id: string) {
    return this.ispsService.remove(id);
  }
}
