import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db.js';

// Load environment variables
dotenv.config();

// Ensure the database connection
connectDB();

const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

