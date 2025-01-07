import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db.js';


// Loading the environment variables
dotenv.config();

// Ensuring the database connection
connectDB();

const PORT = process.env.PORT || 4000;

// Starting the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
