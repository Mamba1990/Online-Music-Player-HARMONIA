import request from 'supertest';
import { expect } from 'chai';
import app from '../app.js';

describe('Auth API', () => {
    const credentials = { name: 'Jane', email: 'Jane@Example.com', password: 'password123' };

    describe('POST /auth/signup', () => {
        it('creates a user, normalizes the email and ignores a requested role', async () => {
            const res = await request(app).post('/auth/signup').send({ ...credentials, role: 'admin' });

            expect(res.status).to.equal(201);
            expect(res.body.user.role).to.equal('user');
            expect(res.body.user.email).to.equal('jane@example.com');
        });

        it('rejects a password shorter than 8 characters', async () => {
            const res = await request(app).post('/auth/signup').send({ ...credentials, password: '123' });
            expect(res.status).to.equal(400);
        });

        it('rejects a duplicate email', async () => {
            await request(app).post('/auth/signup').send(credentials);
            const res = await request(app).post('/auth/signup').send(credentials);
            expect(res.status).to.equal(400);
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/auth/signup').send(credentials);
        });

        it('returns a token for valid credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: credentials.email, password: credentials.password });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
        });

        it('returns 401 for a wrong password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: credentials.email, password: 'wrong-password' });
            expect(res.status).to.equal(401);
        });

        it('returns 401 for an unknown email', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'nobody@example.com', password: 'password123' });
            expect(res.status).to.equal(401);
        });
    });
});