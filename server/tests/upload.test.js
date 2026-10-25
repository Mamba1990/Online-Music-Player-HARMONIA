import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { expect } from 'chai';
import app from '../app.js';
import Track from '../models/Track.js';
import { createUser, bearer } from './helpers.js';

const UPLOADS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
const fakeAudio = Buffer.from('fake audio data');

describe('Upload API', () => {
    // Supprime les fichiers créés par les tests dans server/uploads
    afterEach(async () => {
        const tracks = await Track.find();
        tracks.forEach((track) => {
            fs.rmSync(path.join(UPLOADS_DIR, path.basename(track.filePath)), { force: true });
        });
    });

    const send = (token) =>
        request(app)
            .post('/upload')
            .set(token ? bearer(token) : {})
            .field('title', 'Song')
            .field('artist', 'Artist')
            .field('duration', '180');

    it('requires a token', async () => {
        const res = await send().attach('audio', fakeAudio, { filename: 'a.mp3', contentType: 'audio/mpeg' });
        expect(res.status).to.equal(401);
    });

    it('is forbidden for a regular user', async () => {
        const { token } = await createUser({ role: 'user' });
        const res = await send(token).attach('audio', fakeAudio, { filename: 'a.mp3', contentType: 'audio/mpeg' });
        expect(res.status).to.equal(403);
    });

    it('lets an admin upload and stores a relative filePath', async () => {
        const { token } = await createUser({ role: 'admin' });
        const res = await send(token).attach('audio', fakeAudio, { filename: 'My Song.mp3', contentType: 'audio/mpeg' });

        expect(res.status).to.equal(201);
        expect(res.body.data.filePath).to.match(/^uploads\/[0-9a-f-]{36}\.mp3$/);
        expect(fs.existsSync(path.join(UPLOADS_DIR, path.basename(res.body.data.filePath)))).to.equal(true);
    });

    it('rejects a non-audio file', async () => {
        const { token } = await createUser({ role: 'admin' });
        const res = await send(token).attach('audio', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' });
        expect(res.status).to.equal(400);
    });

    it('rejects a request without a file', async () => {
        const { token } = await createUser({ role: 'admin' });
        const res = await send(token);
        expect(res.status).to.equal(400);
    });

    it('rejects invalid metadata', async () => {
        const { token } = await createUser({ role: 'admin' });
        const res = await request(app)
            .post('/upload')
            .set(bearer(token))
            .field('title', '')
            .field('artist', 'Artist')
            .field('duration', '180')
            .attach('audio', fakeAudio, { filename: 'a.mp3', contentType: 'audio/mpeg' });
        expect(res.status).to.equal(400);
    });
});