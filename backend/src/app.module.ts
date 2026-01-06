import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './infrastructure/repositoy.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ModuleService } from './application/services/module.service';
import { ModuleController } from './interfaces/controllers/module.controller';
import { ModuleRepository } from './infrastructure/repositories/module.repository';
import { MODULESCHEMA, ModuleModel } from './infrastructure/schemas/module.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RepositoryModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: ModuleModel.name, schema: MODULESCHEMA },
    ]),
  ],
  controllers: [AppController, ModuleController],
  providers: [
    AppService,
    ModuleService,
    {
      provide: 'IModuleRepository',
      useClass: ModuleRepository,
    },
  ],
})
export class AppModule {}
