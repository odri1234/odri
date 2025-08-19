// src/modules/sessions/repositories/device.repository.ts

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Injectable()
export class DeviceRepository extends Repository<Device> {
  constructor(private readonly dataSource: DataSource) {
    super(Device, dataSource.createEntityManager());
  }
}
