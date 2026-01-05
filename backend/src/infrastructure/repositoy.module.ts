import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from './schemas/user.schema';

import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]),
  ],
  providers: [
    { provide: 'IUserRepository', useClass: UserRepository },
  ],
  exports: [
    'IUserRepository',
  ],
})
export class RepositoryModule {}
