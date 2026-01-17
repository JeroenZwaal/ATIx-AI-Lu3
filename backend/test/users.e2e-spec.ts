/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthResponseDto } from '../src/interfaces/presenters/auth.dto';

describe('Users (e2e)', () => {
    let app: INestApplication<App>;
    let authToken: string;
    let testUserId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Create test user and get auth token
        const testUser = {
            email: `test-users-${Date.now()}@example.com`,
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

    describe('/api/user/getProfile (GET)', () => {
        it('should return user profile', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/user/getProfile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('studyProgram');
            expect(response.body).toHaveProperty('studyLocation');
            expect(response.body).toHaveProperty('skills');
            expect(response.body).toHaveProperty('interests');
        });

        it('should require authentication', async () => {
            await request(app.getHttpServer()).get('/api/user/getProfile').expect(401);
        });
    });

    describe('/api/user/updateProfile (POST)', () => {
        it('should update user profile with valid data', async () => {
            const profileData = {
                studyProgram: 'Software Engineering',
                studyLocation: 'Amsterdam',
                studyCredits: 30,
                yearOfStudy: 2,
                skills: ['Python', 'JavaScript'],
                interests: ['AI', 'Web Development'],
            };

            const response = await request(app.getHttpServer())
                .post('/api/user/updateProfile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)
                .expect(201);

            expect(response.body).toEqual({ message: 'Profile updated successfully' });
        });

        it('should reject empty studyProgram', async () => {
            const profileData = {
                studyProgram: '   ',
            };

            await request(app.getHttpServer())
                .post('/api/user/updateProfile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)
                .expect(500);
        });

        it('should reject too long studyProgram', async () => {
            const profileData = {
                studyProgram: 'a'.repeat(101),
            };

            await request(app.getHttpServer())
                .post('/api/user/updateProfile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)
                .expect(500);
        });

        it('should reject invalid studyCredits', async () => {
            const profileData = {
                studyCredits: 'not-a-number',
            };

            await request(app.getHttpServer())
                .post('/api/user/updateProfile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)
                .expect(500);
        });

        it('should reject yearOfStudy out of range', async () => {
            const profileData = {
                yearOfStudy: 11,
            };

            await request(app.getHttpServer())
                .post('/api/user/updateProfile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)
                .expect(500);
        });

        it('should accept partial profile updates', async () => {
            const profileData = {
                skills: ['Java', 'Docker'],
            };

            const response = await request(app.getHttpServer())
                .post('/api/user/updateProfile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData)
                .expect(201);

            expect(response.body).toEqual({ message: 'Profile updated successfully' });
        });

        it('should require authentication', async () => {
            const profileData = {
                studyProgram: 'Test',
            };

            await request(app.getHttpServer())
                .post('/api/user/updateProfile')
                .send(profileData)
                .expect(401);
        });
    });

    describe('/api/user/favorites (GET)', () => {
        it('should return user favorites', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/user/favorites')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should require authentication', async () => {
            await request(app.getHttpServer()).get('/api/user/favorites').expect(401);
        });
    });

    describe('/api/user/favorites/:moduleId (POST)', () => {
        it('should add favorite module', async () => {
            // First, get a valid module ID from the modules endpoint
            const modulesResponse = await request(app.getHttpServer())
                .get('/api/modules')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            if (modulesResponse.body.length > 0) {
                const moduleId = modulesResponse.body[0].id;

                const response = await request(app.getHttpServer())
                    .post(`/api/user/favorites/${moduleId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(201);

                expect(response.body).toEqual({ message: 'Favorite added successfully' });
            }
        });

        it('should handle non-existent module ID', async () => {
            await request(app.getHttpServer())
                .post('/api/user/favorites/507f1f77bcf86cd799439999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });

        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .post('/api/user/favorites/507f1f77bcf86cd799439011')
                .expect(401);
        });
    });

    describe('/api/user/favorites/:moduleId (DELETE)', () => {
        it('should remove favorite module', async () => {
            // First add a favorite, then remove it
            const modulesResponse = await request(app.getHttpServer())
                .get('/api/modules')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            if (modulesResponse.body.length > 0) {
                const moduleId = modulesResponse.body[0].id;

                // Add favorite
                await request(app.getHttpServer())
                    .post(`/api/user/favorites/${moduleId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(201);

                // Remove favorite
                const response = await request(app.getHttpServer())
                    .delete(`/api/user/favorites/${moduleId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);

                expect(response.body).toEqual({ message: 'Favorite removed successfully' });
            }
        });

        it('should require authentication', async () => {
            await request(app.getHttpServer())
                .delete('/api/user/favorites/507f1f77bcf86cd799439011')
                .expect(401);
        });
    });
});
