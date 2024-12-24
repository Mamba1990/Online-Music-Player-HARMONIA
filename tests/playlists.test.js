/* import chai from 'chai'; // Correct import of chai
import chaiHttp from 'chai-http'; // Import chai-http
import { expect } from 'chai'; // Import expect (for assertions)
import app from '../server/app.js'; // Adjust path if necessary
import Playlist from '../models/Playlist.js'; // Import the Playlist model to manage test data

// Attach chaiHttp to chai
chai.use(chaiHttp);

describe('Playlists API Tests', () => {
    // Clear the database before running tests
    before(async () => {
        await Playlist.deleteMany(); // Remove all playlists from the test database
    });

    // Clear any remaining data after the tests
    after(async () => {
        await Playlist.deleteMany(); // Clean up after all tests
    });

    // 1. Test: Retrieve all playlists
    describe('GET /playlists', () => {
        before(async () => {
            await Playlist.create({ name: 'Chill Vibes', description: 'Relax and unwind' });
        });

        it('should retrieve all playlists', (done) => {
            chai.request(app)
                .get('/playlists') // API endpoint for retrieving playlists
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
                    done();
                });
        });
    });

    // 2. Test: Create a new playlist
    describe('POST /playlists', () => {
        it('should create a new playlist', (done) => {
            const newPlaylist = { name: 'Workout Hits', description: 'Energy boosting tracks' };
            chai.request(app)
                .post('/playlists') // API endpoint for creating a playlist
                .send(newPlaylist)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data.name).to.equal('Workout Hits');
                    done();
                });
        });
    });

    // 3. Test: Delete a playlist by ID
    describe('DELETE /playlists/:id', () => {
        let playlistId;

        before(async () => {
            const playlist = await Playlist.create({ name: 'Delete Me', description: 'Temporary playlist' });
            playlistId = playlist._id.toString();
        });

        it('should delete a playlist by ID', (done) => {
            chai.request(app)
                .delete(`/playlists/${playlistId}`) // API endpoint for deleting a playlist
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.message).to.equal(`Playlist with ID ${playlistId} has been deleted.`);
                    done();
                });
        });
    });
});
*/
import chai from 'chai'; // Import chai
import chaiHttp from 'chai-http'; // Import chai-http
import { expect } from 'chai'; // Import expect (for assertions)
import app from '../server/app.js'; // Adjust path if necessary

chai.use(chaiHttp); // Attach chaiHttp to chai

describe('Playlists API Tests', () => {
    it('should retrieve all playlists', (done) => {
        chai.request(app)
            .get('/playlists')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should create a new playlist', (done) => {
        const newPlaylist = { name: 'Chill Vibes', description: 'Relax and unwind' };
        chai.request(app)
            .post('/playlists')
            .send(newPlaylist)
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
                expect(res.body.name).to.equal('Chill Vibes');
                done();
            });
    });

    it('should delete a playlist by ID', (done) => {
        const playlistId = 'validIdForTesting'; // Replace with a valid mock ID
        chai.request(app)
            .delete(`/playlists/${playlistId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.message).to.equal(`Playlist with ID ${playlistId} has been deleted.`);
                done();
            });
    });
});
