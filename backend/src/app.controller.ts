import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('connection-test')
    getConnectionTest(): object {
        return {
            status: 'OK',
            message: 'Database connection is successful',
            timestamp: new Date().toISOString(),
        };
    }
}
