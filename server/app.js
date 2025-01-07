import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import playlistsRouter from './routes/playlistsRoutes.js';
import tracksRouter from './routes/tracksRoutes.js';
import usersRouter from './routes/usersRoutes.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/uploadRoutes.js';
import connectDB from './db.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Harmonia Backend!');
});

app.use('/playlists', playlistsRouter);
app.use('/tracks', tracksRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));//serving static files in the 'uploads' directory
app.use('/upload', uploadRouter); //Prefix for the uploaded route

export default app;


