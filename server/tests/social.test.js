import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import app from '../app.js';
import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';
import Comment from '../models/Comment.js';
import { createUser, bearer } from './helpers.js';

const adminToken = (user) =>
    jwt.sign({ id: user._id.toString(), role: 'admin' }, process.env.JWT_SECRET, {
        audience: 'HARMONIA',
        issuer: 'Hafsa Daoudim',
        expiresIn: '1h',
    });

describe('Playlist visibility, likes, copies and comments', () => {
    let owner;
    let other;
    let admin;

    beforeEach(async () => {
        await Comment.deleteMany({});
        owner = await createUser();
        other = await createUser();
        admin = await createUser();
    });

    const makePlaylist = (fields = {}) =>
        Playlist.create({ name: 'Chill', createdBy: owner.user._id, ...fields });

    // ---------- Visibilité ----------

    describe('visibility', () => {
        it('playlists are public by default', async () => {
            const playlist = await makePlaylist();
            expect(playlist.isPublic).to.equal(true);

            const res = await request(app).get('/playlists');
            expect(res.body.data).to.have.lengthOf(1);
            expect(res.body.data[0].isPublic).to.equal(true);
        });

        it('a private playlist is hidden from visitors, in the list and by ID', async () => {
            const playlist = await makePlaylist({ isPublic: false });

            const list = await request(app).get('/playlists');
            expect(list.body.data).to.have.lengthOf(0);

            const one = await request(app).get(`/playlists/${playlist._id}`);
            expect(one.status).to.equal(404);
        });

        it('a private playlist is hidden from other users', async () => {
            const playlist = await makePlaylist({ isPublic: false });

            const list = await request(app).get('/playlists').set(bearer(other.token));
            expect(list.body.data).to.have.lengthOf(0);

            const one = await request(app).get(`/playlists/${playlist._id}`).set(bearer(other.token));
            expect(one.status).to.equal(404);
        });

        it('a private playlist stays visible to its owner and to admins', async () => {
            const playlist = await makePlaylist({ isPublic: false });

            const mine = await request(app).get(`/playlists/${playlist._id}`).set(bearer(owner.token));
            expect(mine.status).to.equal(200);

            const asAdmin = await request(app)
                .get(`/playlists/${playlist._id}`)
                .set({ Authorization: `Bearer ${adminToken(admin.user)}` });
            expect(asAdmin.status).to.equal(200);

            const list = await request(app).get('/playlists').set(bearer(owner.token));
            expect(list.body.data).to.have.lengthOf(1);
        });

        it('an invalid token is treated like a visitor on public routes', async () => {
            await makePlaylist({ isPublic: false });
            await makePlaylist();
            const res = await request(app).get('/playlists').set(bearer('not-a-token'));
            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(1);
        });

        it('the owner can make a playlist private and public again', async () => {
            const playlist = await makePlaylist();
            const priv = await request(app)
                .put(`/playlists/${playlist._id}`)
                .set(bearer(owner.token))
                .send({ isPublic: false });
            expect(priv.status).to.equal(200);
            expect(priv.body.data.isPublic).to.equal(false);

            const pub = await request(app)
                .put(`/playlists/${playlist._id}`)
                .set(bearer(owner.token))
                .send({ isPublic: true });
            expect(pub.body.data.isPublic).to.equal(true);
        });

        it('rejects a non-boolean isPublic', async () => {
            const playlist = await makePlaylist();
            const put = await request(app)
                .put(`/playlists/${playlist._id}`)
                .set(bearer(owner.token))
                .send({ isPublic: 'yes' });
            expect(put.status).to.equal(400);

            const post = await request(app)
                .post('/playlists')
                .set(bearer(owner.token))
                .send({ name: 'X', isPublic: 'no' });
            expect(post.status).to.equal(400);
        });

        it('POST /playlists can create a private playlist', async () => {
            const res = await request(app)
                .post('/playlists')
                .set(bearer(owner.token))
                .send({ name: 'Secret', isPublic: false });
            expect(res.status).to.equal(201);
            expect(res.body.data.isPublic).to.equal(false);
        });

        it('another user gets 404 (not 403) when editing a private playlist, 403 on a public one', async () => {
            const priv = await makePlaylist({ isPublic: false });
            const pub = await makePlaylist();

            const a = await request(app).put(`/playlists/${priv._id}`).set(bearer(other.token)).send({ name: 'x' });
            expect(a.status).to.equal(404);

            const b = await request(app).put(`/playlists/${pub._id}`).set(bearer(other.token)).send({ name: 'x' });
            expect(b.status).to.equal(403);
        });

        it('the list exposes the author name', async () => {
            await makePlaylist();
            const res = await request(app).get('/playlists');
            expect(res.body.data[0].author.name).to.equal(owner.user.name);
            expect(res.body.data[0].author).to.have.property('hasAvatar', false);
            expect(res.body.data[0]).to.not.have.property('likes');
        });
    });

    // ---------- Likes ----------

    describe('likes', () => {
        it('requires a token', async () => {
            const playlist = await makePlaylist();
            const res = await request(app).post(`/playlists/${playlist._id}/like`);
            expect(res.status).to.equal(401);
        });

        it('likes once per user and can be undone', async () => {
            const playlist = await makePlaylist();
            const like = () => request(app).post(`/playlists/${playlist._id}/like`).set(bearer(other.token));

            const first = await like();
            expect(first.status).to.equal(200);
            expect(first.body.data).to.deep.equal({ likesCount: 1, liked: true });

            const again = await like();
            expect(again.body.data.likesCount).to.equal(1);

            const second = await request(app).post(`/playlists/${playlist._id}/like`).set(bearer(owner.token));
            expect(second.body.data.likesCount).to.equal(2);

            const unlike = await request(app).delete(`/playlists/${playlist._id}/like`).set(bearer(other.token));
            expect(unlike.body.data).to.deep.equal({ likesCount: 1, liked: false });
        });

        it('the list shows the count and whether I liked it', async () => {
            const playlist = await makePlaylist();
            await request(app).post(`/playlists/${playlist._id}/like`).set(bearer(other.token));

            const mine = await request(app).get('/playlists').set(bearer(other.token));
            expect(mine.body.data[0].likesCount).to.equal(1);
            expect(mine.body.data[0].liked).to.equal(true);

            const theirs = await request(app).get('/playlists').set(bearer(owner.token));
            expect(theirs.body.data[0].likesCount).to.equal(1);
            expect(theirs.body.data[0].liked).to.equal(false);
        });

        it('cannot like a private playlist of someone else', async () => {
            const playlist = await makePlaylist({ isPublic: false });
            const res = await request(app).post(`/playlists/${playlist._id}/like`).set(bearer(other.token));
            expect(res.status).to.equal(404);
        });
    });

    // ---------- Copie ----------

    describe('copy', () => {
        it('requires a token', async () => {
            const playlist = await makePlaylist();
            const res = await request(app).post(`/playlists/${playlist._id}/copy`);
            expect(res.status).to.equal(401);
        });

        it('creates a private copy owned by the caller, with the same tracks', async () => {
            const track = await Track.create({ title: 'T', artist: 'A', duration: 10, filePath: 'https://example.com/a.mp3' });
            const playlist = await makePlaylist({ tracks: [track._id], description: 'Relax' });

            const res = await request(app).post(`/playlists/${playlist._id}/copy`).set(bearer(other.token));
            expect(res.status).to.equal(201);
            expect(res.body.data.name).to.equal('Chill (copy)');
            expect(res.body.data.description).to.equal('Relax');
            expect(res.body.data.isPublic).to.equal(false);
            expect(res.body.data.createdBy).to.equal(other.user._id.toString());
            expect(res.body.data.tracks.map(String)).to.deep.equal([track._id.toString()]);
            expect(res.body.data._id).to.not.equal(playlist._id.toString());
        });

        it('cannot copy a private playlist of someone else', async () => {
            const playlist = await makePlaylist({ isPublic: false });
            const res = await request(app).post(`/playlists/${playlist._id}/copy`).set(bearer(other.token));
            expect(res.status).to.equal(404);
        });
    });

    // ---------- Commentaires ----------

    describe('comments', () => {
        const post = (playlist, token, text) =>
            request(app).post(`/playlists/${playlist._id}/comments`).set(bearer(token)).send({ text });

        it('lists comments publicly, newest first', async () => {
            const playlist = await makePlaylist();
            await post(playlist, other.token, 'first');
            await post(playlist, owner.token, 'second');

            const res = await request(app).get(`/playlists/${playlist._id}/comments`);
            expect(res.status).to.equal(200);
            expect(res.body.data.map((c) => c.text)).to.deep.equal(['second', 'first']);
            expect(res.body.data[0].author.name).to.equal(owner.user.name);
            expect(res.body.data[0].canDelete).to.equal(false);
        });

        it('requires a token to comment', async () => {
            const playlist = await makePlaylist();
            const res = await request(app).post(`/playlists/${playlist._id}/comments`).send({ text: 'hi' });
            expect(res.status).to.equal(401);
        });

        it('lets any signed-in user comment, with the author attached', async () => {
            const playlist = await makePlaylist();
            const res = await post(playlist, other.token, '  Great mix!  ');
            expect(res.status).to.equal(201);
            expect(res.body.data.text).to.equal('Great mix!');
            expect(res.body.data.author.name).to.equal(other.user.name);
            expect(res.body.data.canDelete).to.equal(true);
        });

        it('rejects empty, blank, non-string and too long comments', async () => {
            const playlist = await makePlaylist();
            for (const bad of ['', '   ', 42, undefined]) {
                const res = await post(playlist, other.token, bad);
                expect(res.status, String(bad)).to.equal(400);
            }
            const tooLong = await post(playlist, other.token, 'x'.repeat(501));
            expect(tooLong.status).to.equal(400);

            const exact = await post(playlist, other.token, 'x'.repeat(500));
            expect(exact.status).to.equal(201);
        });

        it('returns 404 for an unknown playlist and 400 for a bad ID', async () => {
            const unknown = await request(app)
                .post(`/playlists/${new mongoose.Types.ObjectId()}/comments`)
                .set(bearer(other.token))
                .send({ text: 'hi' });
            expect(unknown.status).to.equal(404);

            const bad = await request(app).get('/playlists/not-an-id/comments');
            expect(bad.status).to.equal(400);
        });

        it('hides comments of a private playlist from others', async () => {
            const playlist = await makePlaylist({ isPublic: false });

            const read = await request(app).get(`/playlists/${playlist._id}/comments`).set(bearer(other.token));
            expect(read.status).to.equal(404);

            const write = await post(playlist, other.token, 'hi');
            expect(write.status).to.equal(404);

            const mine = await post(playlist, owner.token, 'note to self');
            expect(mine.status).to.equal(201);
        });

        it('canDelete is true for the author, the playlist owner and admins only', async () => {
            const playlist = await makePlaylist();
            await post(playlist, other.token, 'hello');
            const flags = async (token) => {
                const res = await request(app).get(`/playlists/${playlist._id}/comments`).set(token);
                return res.body.data[0].canDelete;
            };
            expect(await flags(bearer(other.token))).to.equal(true);
            expect(await flags(bearer(owner.token))).to.equal(true);
            expect(await flags({ Authorization: `Bearer ${adminToken(admin.user)}` })).to.equal(true);
            const stranger = await createUser();
            expect(await flags(bearer(stranger.token))).to.equal(false);
        });

        it('lets the author delete their comment', async () => {
            const playlist = await makePlaylist();
            const created = await post(playlist, other.token, 'hello');
            const res = await request(app)
                .delete(`/playlists/${playlist._id}/comments/${created.body.data._id}`)
                .set(bearer(other.token));
            expect(res.status).to.equal(200);
            expect(await Comment.countDocuments()).to.equal(0);
        });

        it('lets the playlist owner and admins delete any comment', async () => {
            const playlist = await makePlaylist();
            const a = await post(playlist, other.token, 'one');
            const b = await post(playlist, other.token, 'two');

            const byOwner = await request(app)
                .delete(`/playlists/${playlist._id}/comments/${a.body.data._id}`)
                .set(bearer(owner.token));
            expect(byOwner.status).to.equal(200);

            const byAdmin = await request(app)
                .delete(`/playlists/${playlist._id}/comments/${b.body.data._id}`)
                .set({ Authorization: `Bearer ${adminToken(admin.user)}` });
            expect(byAdmin.status).to.equal(200);
        });

        it('forbids deleting someone else’s comment', async () => {
            const playlist = await makePlaylist();
            const created = await post(playlist, other.token, 'hello');
            const stranger = await createUser();
            const res = await request(app)
                .delete(`/playlists/${playlist._id}/comments/${created.body.data._id}`)
                .set(bearer(stranger.token));
            expect(res.status).to.equal(403);
            expect(await Comment.countDocuments()).to.equal(1);
        });

        it('returns 404 for an unknown comment and 400 for a bad comment ID', async () => {
            const playlist = await makePlaylist();
            const unknown = await request(app)
                .delete(`/playlists/${playlist._id}/comments/${new mongoose.Types.ObjectId()}`)
                .set(bearer(owner.token));
            expect(unknown.status).to.equal(404);

            const bad = await request(app)
                .delete(`/playlists/${playlist._id}/comments/not-an-id`)
                .set(bearer(owner.token));
            expect(bad.status).to.equal(400);
        });

        it('does not delete a comment through another playlist', async () => {
            const first = await makePlaylist();
            const second = await makePlaylist();
            const created = await post(first, other.token, 'hello');
            const res = await request(app)
                .delete(`/playlists/${second._id}/comments/${created.body.data._id}`)
                .set(bearer(owner.token));
            expect(res.status).to.equal(404);
        });
    });

    // ---------- Nettoyage ----------

    describe('cleanup', () => {
        it('deleting a playlist removes its comments', async () => {
            const playlist = await makePlaylist();
            await request(app).post(`/playlists/${playlist._id}/comments`).set(bearer(other.token)).send({ text: 'hi' });
            const res = await request(app).delete(`/playlists/${playlist._id}`).set(bearer(owner.token));
            expect(res.status).to.equal(200);
            expect(await Comment.countDocuments()).to.equal(0);
        });

        it('deleting a user removes their comments, their likes and their playlists’ comments', async () => {
            const mine = await makePlaylist();
            const theirs = await Playlist.create({ name: 'Other', createdBy: other.user._id });

            await request(app).post(`/playlists/${mine._id}/comments`).set(bearer(other.token)).send({ text: 'a' });
            await request(app).post(`/playlists/${mine._id}/like`).set(bearer(other.token));
            await request(app).post(`/playlists/${theirs._id}/comments`).set(bearer(owner.token)).send({ text: 'b' });

            const res = await request(app).delete(`/users/${other.user._id}`).set(bearer(other.token));
            expect(res.status).to.equal(200);

            expect(await Comment.countDocuments()).to.equal(0);
            expect(await Playlist.findById(theirs._id)).to.equal(null);
            const reloaded = await Playlist.findById(mine._id);
            expect(reloaded.likes).to.have.lengthOf(0);
        });
    });
});
