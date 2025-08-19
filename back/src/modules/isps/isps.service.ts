import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Isp } from './entities/isp.entity';
import { IspSettings } from './entities/isp-settings.entity';
import { IspBranding } from './entities/isp-branding.entity';
import { CreateIspDto } from './dto/create-isp.dto';
import { UpdateIspDto } from './dto/update-isp.dto';
import { IspSettingsDto } from './dto/isp-settings.dto';

@Injectable()
export class IspsService {
  constructor(
    @InjectRepository(Isp)
    private readonly ispRepository: Repository<Isp>,

    @InjectRepository(IspSettings)
    private readonly settingsRepository: Repository<IspSettings>,

    @InjectRepository(IspBranding)
    private readonly brandingRepository: Repository<IspBranding>,
  ) {}

  async create(createIspDto: CreateIspDto): Promise<Isp> {
    const exists = await this.ispRepository.findOne({
      where: { name: createIspDto.name },
    });
    if (exists) throw new BadRequestException('ISP with this name already exists');

    const isp = this.ispRepository.create(createIspDto);
    return await this.ispRepository.save(isp);
  }

  async findAll(): Promise<Isp[]> {
    return await this.ispRepository.find({ relations: ['settings', 'branding'] });
  }

  async findOne(id: string): Promise<Isp> {
    const isp = await this.ispRepository.findOne({
      where: { id },
      relations: ['settings', 'branding'],
    });
    if (!isp) throw new NotFoundException('ISP not found');
    return isp;
  }

  async update(id: string, updateDto: UpdateIspDto): Promise<Isp> {
    const isp = await this.findOne(id);
    Object.assign(isp, updateDto);
    return await this.ispRepository.save(isp);
  }

  async updateSettings(id: string, settingsDto: IspSettingsDto): Promise<IspSettings> {
    const isp = await this.findOne(id);
    let settings = await this.settingsRepository.findOne({ where: { isp: { id } } });

    if (!settings) {
      settings = this.settingsRepository.create({ ...settingsDto, isp });
    } else {
      Object.assign(settings, settingsDto);
    }

    return await this.settingsRepository.save(settings);
  }

  async remove(id: string): Promise<void> {
    const isp = await this.findOne(id);
    await this.ispRepository.remove(isp);
  }

  async getBranding(id: string): Promise<IspBranding> {
    const branding = await this.brandingRepository.findOne({ where: { isp: { id } } });
    if (!branding) throw new NotFoundException('Branding not found');
    return branding;
  }

  async updateBranding(id: string, data: Partial<IspBranding>): Promise<IspBranding> {
    const isp = await this.findOne(id);
    let branding = await this.brandingRepository.findOne({ where: { isp: { id } } });

    if (!branding) {
      branding = this.brandingRepository.create({ ...data, isp });
    } else {
      Object.assign(branding, data);
    }

    return await this.brandingRepository.save(branding);
  }
}
