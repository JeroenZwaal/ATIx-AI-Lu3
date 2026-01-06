import { Module } from '@nestjs/common';
import { ModuleController } from '../interfaces/controllers/module.controller';
import { ModuleService } from '../application/services/module.service';

@Module({
  imports: [],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class ModulesModule {}
