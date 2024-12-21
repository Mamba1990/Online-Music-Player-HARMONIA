// tests/playlists.test.js
import chai from 'chai';  // Correct import of chai
import chaiHttp from 'chai-http'; // Import chai-http
import { expect } from 'chai'; // Import expect (for assertions)
import app from '../server/app.js'; // Adjust path if necessary

// Attach chaiHttp to chai
chai.use(chaiHttp);


describe('Playlists API Tests', () => {
    it('should retrieve all playlists', (done) => {
        chai.request(app)
            .get('/playlists') // Replace with your actual API endpoint
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should create a new playlist', (done) => {
        const newPlaylist = { name: 'Chill Vibes', description: 'Relax and unwind' };
        chai.request(app)
            .post('/playlists') // Replace with your actual API endpoint
            .send(newPlaylist)
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('id');
                expect(res.body.name).to.equal('Chill Vibes');
                done();
            });
    });

    it('should delete a playlist by ID', (done) => {
        const playlistId = 1; // Replace with a valid ID for testing
        chai.request(app)
            .delete(`/playlists/${playlistId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal(`Playlist with ID ${playlistId} has been deleted.`);
                done();
            });
    });
});
