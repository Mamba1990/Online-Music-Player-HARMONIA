import request from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import app from '../app.js';
import Track from '../models/Track.js';
import Playlist from '../models/Playlist.js';
import { createUser, bearer } from './helpers.js';

describe('Tracks API', () => {
    const createTrack = () =>
        Track.create({ title: 'Song', artist: 'Artist', duration: 120, filePath: 'uploads/song.mp3' });

    it('GET /tracks returns the list', async () => {
        await createTrack();
        const res = await request(app).get('/tracks');

        expect(res.status).to.equal(200);
        expect(res.body.data).to.be.an('array').with.lengthOf(1);
    });

    it('GET /tracks/:id returns one track', async () => {
        const track = await createTrack();
        const res = await request(app).get(`/tracks/${track._id}`);

        expect(res.status).to.equal(200);
        expect(res.body.data.title).to.equal('Song');
    });

    it('GET /tracks/:id returns 400 for an invalid ID and 404 for an unknown one', async () => {
        expect((await request(app).get('/tracks/xyz')).status).to.equal(400);
        expect((await request(app).get(`/tracks/${new mongoose.Types.ObjectId()}`)).status).to.equal(404);
    });

    it('PUT /tracks/:id requires an admin', async () => {
        const track = await createTrack();
        const { token } = await createUser({ role: 'user' });

        const res = await request(app).put(`/tracks/${track._id}`).set(bearer(token)).send({ title: 'New' });
        expect(res.status).to.equal(403);
    });

    it('PUT /tracks/:id lets an admin update', async () => {
        const track = await createTrack();
        const { token } = await createUser({ role: 'admin' });

        const res = await request(app).put(`/tracks/${track._id}`).set(bearer(token)).send({ title: 'New' });
        expect(res.status).to.equal(200);
        expect(res.body.data.title).to.equal('New');
    });

    it('DELETE /tracks/:id requires a token', async () => {
        const track = await createTrack();
        const res = await request(app).delete(`/tracks/${track._id}`);
        expect(res.status).to.equal(401);
    });

    it('DELETE /tracks/:id removes the track from playlists', async () => {
        const track = await createTrack();
        const { user, token } = await createUser({ role: 'admin' });
        const playlist = await Playlist.create({ name: 'P', tracks: [track._id], createdBy: user._id });

        const res = await request(app).delete(`/tracks/${track._id}`).set(bearer(token));

        expect(res.status).to.equal(200);
        expect(await Track.findById(track._id)).to.equal(null);
        expect((await Playlist.findById(playlist._id)).tracks).to.have.lengthOf(0);
    });
});