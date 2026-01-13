import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
import { UserController } from './interfaces/controllers/user.controller';
import { UserService } from './application/services/user.service';
import { RecommendationService } from './application/services/recommendation.service';
import { RecommendationController } from './interfaces/controllers/recommendation.controller';
import { RecommendationRepository } from './infrastructure/repositories/recommendation.repository';
import { SecurityMiddleware } from './infrastructure/security/security.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        DatabaseModule,
        RepositoryModule,
        AuthModule,
        MongooseModule.forFeature([{ name: ModuleModel.name, schema: MODULESCHEMA }]),
    ],
    controllers: [AppController, ModuleController, UserController, RecommendationController],
    providers: [
        AppService,
        ModuleService,
        {
            provide: 'IModuleRepository',
            useClass: ModuleRepository,
        },
        UserService,
        {
            provide: 'IRecommendationRepository',
            useClass: RecommendationRepository,
        },
        RecommendationService,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SecurityMiddleware).forRoutes('*');
    }
}
