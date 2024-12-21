import chai from 'chai';  // Correct import of chai
import chaiHttp from 'chai-http'; // Import chai-http
import { expect } from 'chai'; // Import expect (for assertions)
import app from '../server/app.js'; // Adjust path if necessary

// Attach chaiHttp to chai
chai.use(chaiHttp);


describe('Users API Tests', () => {
    it('should retrieve all users', (done) => {
        chai.request(app)
            .get('/users') // Replace with your actual API endpoint
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should create a new user', (done) => {
        const newUser = { name: 'John Doe', email: 'john.doe@example.com' };
        chai.request(app)
            .post('/users') // Replace with your actual API endpoint
            .send(newUser)
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('id');
                expect(res.body.name).to.equal('John Doe');
                done();
            });
    });

    it('should delete a user by ID', (done) => {
        const userId = 1; // Replace with a valid ID for testing
        chai.request(app)
            .delete(`/users/${userId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal(`User with ID ${userId} has been deleted.`);
                done();
            });
    });
});
