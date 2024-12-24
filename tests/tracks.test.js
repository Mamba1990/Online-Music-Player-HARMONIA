import chai from 'chai'; // Correct import of chai
import chaiHttp from 'chai-http'; // Import chai-http
import { expect } from 'chai'; // Import expect (for assertions)
import app from '../server/app.js'; // Adjust path if necessary
import Track from '../models/Track.js'; // Import the Track model to manage test data

// Attach chaiHttp to chai
chai.use(chaiHttp);

describe('Tracks API Tests', () => {
    // Clear the database before running tests
    before(async () => {
        await Track.deleteMany(); // Remove all tracks from the test database
    });

    // Clear any remaining data after the tests
    after(async () => {
        await Track.deleteMany(); // Clean up after all tests
    });

    // 1. Test: Retrieve all tracks
    describe('GET /tracks', () => {
        before(async () => {
            await Track.create({ title: 'Track 1', artist: 'Artist 1', album: 'Album 1' });
        });

        it('should retrieve all tracks', (done) => {
            chai.request(app)
                .get('/tracks') // API endpoint for retrieving tracks
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
                    done();
                });
        });
    });

    // 2. Test: Create a new track
    describe('POST /tracks', () => {
        it('should create a new track', (done) => {
            const newTrack = { title: 'Track 2', artist: 'Artist 2', album: 'Album 2' };
            chai.request(app)
                .post('/tracks') // API endpoint for creating a track
                .send(newTrack)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data.title).to.equal('Track 2');
                    done();
                });
        });
    });

    // 3. Test: Delete a track by ID
    describe('DELETE /tracks/:id', () => {
        let trackId;

        before(async () => {
            const track = await Track.create({ title: 'Track to Delete', artist: 'Artist', album: 'Album' });
            trackId = track._id.toString();
        });

        it('should delete a track by ID', (done) => {
            chai.request(app)
                .delete(`/tracks/${trackId}`) // API endpoint for deleting a track
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.message).to.equal(`Track with ID ${trackId} has been deleted.`);
                    done();
                });
        });
    });
});
