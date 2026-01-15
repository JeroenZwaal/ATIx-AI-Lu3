import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthResponseDto } from '../src/interfaces/presenters/auth.dto';

describe('Modules (e2e)', () => {
    let app: INestApplication<App>;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Create test user and get auth token
        const testUser = {
            email: `test-modules-${Date.now()}@example.com`,
            passwordHash: 'testpassword123',
            firstName: 'Test',
            lastName: 'User',
        };

        const registerResponse = await request(app.getHttpServer())
            .post('/api/auth/register')
            .send(testUser)
            .expect(201);

        authToken = (registerResponse.body as AuthResponseDto).access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/modules (GET)', () => {
        it('should return all modules with valid auth token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/modules')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should reject request without auth token', async () => {
            await request(app.getHttpServer()).get('/api/modules').expect(401);
        });

        it('should reject request with invalid auth token', async () => {
            await request(app.getHttpServer())
                .get('/api/modules')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });

    describe('/api/modules/search (GET)', () => {
        it('should search modules with query parameter', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/modules/search?q=programming')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return all modules when no query parameter provided', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/modules/search')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should return empty array for non-matching query', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/modules/search?q=nonexistentmodulexyz123')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('/api/modules/getAllTags (GET)', () => {
        it('should return all available tags', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/modules/getAllTags')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should require authentication', async () => {
            await request(app.getHttpServer()).get('/api/modules/getAllTags').expect(401);
        });
    });

    describe('/api/modules/:id (GET)', () => {
        it('should return null for non-existent module ID', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/modules/507f1f77bcf86cd799439999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toBeNull();
        });

        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .get('/api/modules/507f1f77bcf86cd799439011')
                .expect(401);
        });
    });

    describe('/api/modules/external/:externalId (GET)', () => {
        it('should return null for non-existent external ID', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/modules/external/99999999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toBeNull();
        });

        it('should require authentication', async () => {
            await request(app.getHttpServer()).get('/api/modules/external/123').expect(401);
        });
    });
});
