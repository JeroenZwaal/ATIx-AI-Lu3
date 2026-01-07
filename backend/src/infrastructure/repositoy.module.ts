import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { USERSCHEMA } from './schemas/user.schema';
import { MODULESCHEMA, ModuleModel } from './schemas/module.schema';

import { UserRepository } from './repositories/user.repository';
import { ModuleRepository } from './repositories/module.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: USERSCHEMA },
            { name: ModuleModel.name, schema: MODULESCHEMA },
        ]),
    ],
    providers: [
        { provide: 'IUserRepository', useClass: UserRepository },
        { provide: 'IModuleRepository', useClass: ModuleRepository },
    ],
    exports: ['IUserRepository', 'IModuleRepository'],
})
export class RepositoryModule {}
