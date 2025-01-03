import express from 'express';
import cors from 'cors';
import playlistsRouter from './routes/playlistsRoutes.js';
import tracksRouter from './routes/tracksRoutes.js';
import usersRouter from './routes/usersRoutes.js';
import authRouter from './routes/auth.js';
import connectDB from './db.js';

const app = express();

connectDB();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Harmonia Backend!');
});

app.use('/playlists', playlistsRouter);
app.use('/tracks', tracksRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

export default app;


