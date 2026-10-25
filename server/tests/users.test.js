import request from 'supertest';
import { expect } from 'chai';
import app from '../app.js';
import User from '../models/User.js';
import { createUser, bearer } from './helpers.js';

describe('Users API', () => {
    describe('GET /users', () => {
        it('requires a token', async () => {
            expect((await request(app).get('/users')).status).to.equal(401);
        });

        it('is forbidden for a regular user', async () => {
            const { token } = await createUser();
            expect((await request(app).get('/users').set(bearer(token))).status).to.equal(403);
        });

        it('lets an admin list users without passwords', async () => {
            const { token } = await createUser({ role: 'admin' });
            const res = await request(app).get('/users').set(bearer(token));

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data[0]).to.not.have.property('password');
        });
    });

    describe('GET /users/profile', () => {
        it('returns the connected user without the password', async () => {
            const { user, token } = await createUser();
            const res = await request(app).get('/users/profile').set(bearer(token));

            expect(res.status).to.equal(200);
            expect(res.body.user.email).to.equal(user.email);
            expect(res.body.user).to.not.have.property('password');
        });
    });

    describe('PUT /users/:id', () => {
        it('lets a user update their own name', async () => {
            const { user, token } = await createUser();
            const res = await request(app).put(`/users/${user._id}`).set(bearer(token)).send({ name: 'Renamed' });

            expect(res.status).to.equal(200);
            expect(res.body.user.name).to.equal('Renamed');
        });

        it('is forbidden on another account', async () => {
            const { token } = await createUser();
            const other = await createUser();
            const res = await request(app).put(`/users/${other.user._id}`).set(bearer(token)).send({ name: 'X' });
            expect(res.status).to.equal(403);
        });

        it('requires the current password to change the password', async () => {
            const { user, token } = await createUser();
            const res = await request(app)
                .put(`/users/${user._id}`)
                .set(bearer(token))
                .send({ password: 'new-password-123' });
            expect(res.status).to.equal(400);
        });
    });

    describe('DELETE /users/:id', () => {
        it('lets a user delete their own account', async () => {
            const { user, token } = await createUser();
            const res = await request(app).delete(`/users/${user._id}`).set(bearer(token));

            expect(res.status).to.equal(200);
            expect(await User.findById(user._id)).to.equal(null);
        });

        it('refuses to delete the last admin', async () => {
            const { user, token } = await createUser({ role: 'admin' });
            const res = await request(app).delete(`/users/${user._id}`).set(bearer(token));
            expect(res.status).to.equal(400);
        });
    });
});