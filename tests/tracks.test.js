
// tests/tracks.test.js
import chai from 'chai';  // Correct import of chai
import chaiHttp from 'chai-http'; // Import chai-http
import { expect } from 'chai'; // Import expect (for assertions)
import app from '../server/app.js'; // Adjust path if necessary

// Attach chaiHttp to chai
chai.use(chaiHttp);


describe('Tracks API Tests', () => {
    it('should retrieve all tracks', (done) => {
        chai.request(app)
            .get('/tracks') // Replace with your actual API endpoint
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should create a new track', (done) => {
        const newTrack = { title: 'Track 1', artist: 'Artist 1', album: 'Album 1' };
        chai.request(app)
            .post('/tracks') // Replace with your actual API endpoint
            .send(newTrack)
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('id');
                expect(res.body.title).to.equal('Track 1');
                done();
            });
    });

    it('should delete a track by ID', (done) => {
        const trackId = 1; // Replace with a valid ID for testing
        chai.request(app)
            .delete(`/tracks/${trackId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal(`Track with ID ${trackId} has been deleted.`);
                done();
            });
    });
});
