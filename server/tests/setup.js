import './env.js'; // doit rester le premier import
import mongoose from 'mongoose';
import connectDB from '../db.js';

// Garde-fou : on refuse de tourner sur autre chose qu'une base de test
if (!/_test(\?|$)/.test(process.env.MONGO_URI)) {
    throw new Error(`Refusing to run tests on a non-test database: ${process.env.MONGO_URI}`);
}

before(async () => {
    await connectDB();
});

// Chaque test repart d'une base vide, donc les tests ne dépendent pas les uns des autres
beforeEach(async () => {
    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});