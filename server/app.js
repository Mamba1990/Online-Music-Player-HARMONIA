import express from 'express';
import cors from 'cors'; // Import CORS
import playlistsRouter from './routes/playlistsRoutes.js';
import tracksRouter from './routes/tracksRoutes.js';
import usersRouter from './routes/usersRoutes.js';
import connectDB from './db.js'; // Adjusted path

const app = express();

// Connect to the database
connectDB();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your frontend
}));

// Middleware to parse JSON
app.use(express.json());

// Base route
app.get('/', (req, res) => {
    res.send('Welcome to Harmonia Backend!');
});

// Register routes
app.use('/playlists', playlistsRouter);
app.use('/tracks', tracksRouter);
app.use('/users', usersRouter);

export default app;
