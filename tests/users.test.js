import chai from 'chai'; // Correct import of chai
import chaiHttp from 'chai-http'; // Import chai-http
import { expect } from 'chai'; // Import expect (for assertions)
import app from '../server/app.js'; // Adjust path if necessary
import User from '../models/User.js'; // Import the User model to manage test data

// Attach chaiHttp to chai
chai.use(chaiHttp);

describe('Users API Tests', () => {
    // Clear the database before running tests
    before(async () => {
        await User.deleteMany(); // Remove all users from the test database
    });

    // Clear any remaining data after the tests
    after(async () => {
        await User.deleteMany(); // Clean up after all tests
    });

    // 1. Test: Retrieve all users
    describe('GET /users', () => {
        before(async () => {
            await User.create({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' });
        });

        it('should retrieve all users', (done) => {
            chai.request(app)
                .get('/users') // API endpoint for retrieving users
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('array').that.has.lengthOf(1);
                    done();
                });
        });
    });

    // 2. Test: Create a new user
    describe('POST /users', () => {
        it('should create a new user', (done) => {
            const newUser = { name: 'Jane Doe', email: 'jane.doe@example.com', password: 'password123' };
            chai.request(app)
                .post('/users') // API endpoint for creating a user
                .send(newUser)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.data).to.be.an('object');
                    expect(res.body.data).to.have.property('name', 'Jane Doe');
                    done();
                });
        });
    });

    // 3. Test: Delete a user by ID
    describe('DELETE /users/:id', () => {
        let userId; // Store a user's ID for deletion

        before(async () => {
            const user = await User.create({ name: 'Delete Me', email: 'delete.me@example.com', password: 'password123' });
            userId = user._id.toString(); // Save the user's ID
        });

        it('should delete a user by ID', (done) => {
            chai.request(app)
                .delete(`/users/${userId}`) // API endpoint for deleting a user
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body.message).to.equal(`User with ID ${userId} has been deleted.`);
                    done();
                });
        });
    });
});

