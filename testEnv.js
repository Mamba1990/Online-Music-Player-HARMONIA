import dotenv from 'dotenv';

dotenv.config();  // Auto-load .env from the root folder

console.log(process.env.MONGO_URI);  // It should log the MongoDB URI if the .env file is loaded properly
