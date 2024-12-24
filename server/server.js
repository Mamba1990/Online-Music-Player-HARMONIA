/*import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();
const PORT = process.env.PORT || 4000;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
*/
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db.js';

// Load environment variables
dotenv.config(); 

// Log all environment variables to check if MONGO_URI is loaded correctly
//console.log('Loaded Environment Variables:', process.env);

// Log the MongoDB URI to ensure it's loaded correctly
//console.log(process.env.MONGO_URI);

// Connect to the database
connectDB();

const PORT = process.env.PORT || 4000;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}






