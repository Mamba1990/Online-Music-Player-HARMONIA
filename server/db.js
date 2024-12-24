import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI); // Debug line

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;