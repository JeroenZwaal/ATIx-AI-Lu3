import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from './schemas/user.schema';
import { ModuleSchema } from './schemas/module.schema';

import { UserRepository } from './repositories/user.repository';
import { ModuleRepository } from './repositories/module.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Module', schema: ModuleSchema },
    ]),
  ],
  providers: [
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IModuleRepository', useClass: ModuleRepository },
  ],
  exports: [
    'IUserRepository',
    'IModuleRepository',
  ],
})
export class RepositoryModule {}