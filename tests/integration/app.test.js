import { app } from '#src/app.js';
import request from 'supertest';

describe('API Endpoints', () => {
    describe('GET /health', () => {
        it('should return a health check response', async () => {
            const response = await request(app).get('/api/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('memory');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('checks');
            expect(response.body.checks).toHaveProperty('api', 'up');
            expect(response.body.checks).toHaveProperty('database', 'up');
        });
    });

    describe('GET /health/application', () => {
        it('should return that app is running', async () => {
            const response = await request(app).get('/api/health/app');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'API is running');
        });
    });

    describe('GET /non-existent', () => {
        it('should return a 404 error', async () => {
            const response = await request(app).get('/api/non-existent');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Route not found');
        });
    });
});