import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import app from '../app.js';
import { createUser, bearer } from './helpers.js';

// Un minuscule JPEG valide en data URL (le serveur ne décode pas l'image : il vérifie le format et la taille)
const pixel = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==', 'base64');
const validAvatar = `data:image/jpeg;base64,${pixel.toString('base64')}`;

describe('Avatar API', () => {
    let user;

    beforeEach(async () => {
        user = await createUser();
    });

    const setAvatar = (avatar, token = user.token) =>
        request(app).put('/users/avatar').set(bearer(token)).send({ avatar });

    it('PUT /users/avatar requires a token', async () => {
        const res = await request(app).put('/users/avatar').send({ avatar: validAvatar });
        expect(res.status).to.equal(401);
    });

    it('PUT /users/avatar stores a valid image and the profile returns it', async () => {
        const res = await setAvatar(validAvatar);
        expect(res.status).to.equal(200);
        expect(res.body.user.avatar).to.equal(validAvatar);

        const profile = await request(app).get('/users/profile').set(bearer(user.token));
        expect(profile.body.user.avatar).to.equal(validAvatar);
    });

    it('PUT /users/avatar rejects SVG, scripts and non-images', async () => {
        for (const bad of [
            'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
            'javascript:alert(1)',
            'data:image/png;base64,AA"><script>',
            'https://example.com/me.png',
            123,
            '',
        ]) {
            const res = await setAvatar(bad);
            expect(res.status, String(bad)).to.equal(400);
        }
    });

    it('PUT /users/avatar rejects an image that is too large', async () => {
        const res = await setAvatar(`data:image/png;base64,${'A'.repeat(130000)}`);
        expect(res.status).to.equal(400);
    });

    it('other routes keep the small JSON body limit', async () => {
        const res = await request(app)
            .put(`/users/${user.user._id}`)
            .set(bearer(user.token))
            .send({ name: 'x'.repeat(20000) });
        expect(res.status).to.equal(413);
    });

    it('DELETE /users/avatar removes the photo', async () => {
        await setAvatar(validAvatar);
        const res = await request(app).delete('/users/avatar').set(bearer(user.token));
        expect(res.status).to.equal(200);
        expect(res.body.user.avatar).to.equal('');
    });

    it('GET /users/:id/avatar serves the image publicly', async () => {
        await setAvatar(validAvatar);
        const res = await request(app).get(`/users/${user.user._id}/avatar`).buffer(true).parse((r, cb) => {
            const chunks = [];
            r.on('data', (c) => chunks.push(c));
            r.on('end', () => cb(null, Buffer.concat(chunks)));
        });

        expect(res.status).to.equal(200);
        expect(res.headers['content-type']).to.match(/^image\/jpeg/);
        expect(res.headers['cross-origin-resource-policy']).to.equal('cross-origin');
        expect(Buffer.compare(res.body, pixel)).to.equal(0);
    });

    it('GET /users/:id/avatar returns 404 without a photo and 400 for a bad ID', async () => {
        const none = await request(app).get(`/users/${user.user._id}/avatar`);
        expect(none.status).to.equal(404);

        const unknown = await request(app).get(`/users/${new mongoose.Types.ObjectId()}/avatar`);
        expect(unknown.status).to.equal(404);

        const bad = await request(app).get('/users/not-an-id/avatar');
        expect(bad.status).to.equal(400);
    });

    it('the admin user list never exposes avatars', async () => {
        await setAvatar(validAvatar);
        const admin = await createUser();
        const jwt = (await import('jsonwebtoken')).default;
        const token = jwt.sign({ id: admin.user._id.toString(), role: 'admin' }, process.env.JWT_SECRET, {
            audience: 'HARMONIA',
            issuer: 'Hafsa Daoudim',
            expiresIn: '1h',
        });
        const res = await request(app).get('/users').set(bearer(token));
        expect(res.status).to.equal(200);
        for (const u of res.body.data) expect(u).to.not.have.property('avatar');
    });
});
