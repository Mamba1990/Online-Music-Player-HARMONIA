process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/harmonia_test';
process.env.JWT_SECRET = 'test-secret';