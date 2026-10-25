import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import app from '../app.js';
import Playlist from '../models/Playlist.js';
import { createUser, bearer } from './helpers.js';

describe('Playlists API', () => {
    let owner;
    let other;

    beforeEach(async () => {
        owner = await createUser();
        other = await createUser();
    });

    const createPlaylist = () => Playlist.create({ name: 'Chill', createdBy: owner.user._id });

    it('GET /playlists returns the list', async () => {
        await createPlaylist();
        const res = await request(app).get('/playlists');

        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.data).to.be.an('array').with.lengthOf(1);
    });

    it('GET /playlists/:id returns 400 for an invalid ID', async () => {
        const res = await request(app).get('/playlists/not-an-id');
        expect(res.status).to.equal(400);
    });

    it('GET /playlists/:id returns 404 for an unknown playlist', async () => {
        const res = await request(app).get(`/playlists/${new mongoose.Types.ObjectId()}`);
        expect(res.status).to.equal(404);
    });

    it('POST /playlists requires a token', async () => {
        const res = await request(app).post('/playlists').send({ name: 'Chill' });
        expect(res.status).to.equal(401);
    });

    it('POST /playlists creates a playlist owned by the caller', async () => {
        const res = await request(app)
            .post('/playlists')
            .set(bearer(owner.token))
            .send({ name: 'Chill Vibes', description: 'Relax' });

        expect(res.status).to.equal(201);
        expect(res.body.data.name).to.equal('Chill Vibes');
        expect(res.body.data.createdBy).to.equal(owner.user._id.toString());
    });

    it('POST /playlists rejects unknown track IDs', async () => {
        const res = await request(app)
            .post('/playlists')
            .set(bearer(owner.token))
            .send({ name: 'Chill', tracks: [new mongoose.Types.ObjectId().toString()] });
        expect(res.status).to.equal(400);
    });

    it('PUT /playlists/:id is forbidden for another user', async () => {
        const playlist = await createPlaylist();
        const res = await request(app)
            .put(`/playlists/${playlist._id}`)
            .set(bearer(other.token))
            .send({ name: 'Hacked' });
        expect(res.status).to.equal(403);
    });

    it('PUT /playlists/:id lets the owner update', async () => {
        const playlist = await createPlaylist();
        const res = await request(app)
            .put(`/playlists/${playlist._id}`)
            .set(bearer(owner.token))
            .send({ name: 'Renamed' });

        expect(res.status).to.equal(200);
        expect(res.body.data.name).to.equal('Renamed');
    });

    it('DELETE /playlists/:id lets the owner delete', async () => {
        const playlist = await createPlaylist();
        const res = await request(app).delete(`/playlists/${playlist._id}`).set(bearer(owner.token));

        expect(res.status).to.equal(200);
        expect(await Playlist.findById(playlist._id)).to.equal(null);
    });
});