import { Controller, Get, Param, Query } from '@nestjs/common';
import { ModuleService } from '../../../application/services/module.service';

@Controller('modules')
export class ModuleController {
  constructor(private readonly service: ModuleService) {}

  @Get()
  async getAll() {
    return this.service.findAll();
  }

  @Get('search')
  async search(@Query('q') q: string) {
    return this.service.search(q);
  }

  @Get('external/:externalId')
  async getByExternal(@Param('externalId') externalId: string) {
    const num = Number(externalId);
    return this.service.findByExternalId(num);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
