import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { USERSCHEMA } from './schemas/user.schema';

import { UserRepository } from './repositories/user.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'User', schema: USERSCHEMA }])],
    providers: [{ provide: 'IUserRepository', useClass: UserRepository }],
    exports: ['IUserRepository'],
})
export class RepositoryModule {}
