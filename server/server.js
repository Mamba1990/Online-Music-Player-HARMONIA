
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db.js';

// Load environment variables
dotenv.config(); 



// Connect to the database
connectDB();

const PORT = process.env.PORT || 4000;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(4000, '127.0.0.1', () => {
        console.log('Server is running on http://127.0.0.1:4000');
    });
    
}






