import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import playlistsRouter from './routes/playlistsRoutes.js';
import tracksRouter from './routes/tracksRoutes.js';
import usersRouter from './routes/usersRoutes.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/uploadRoutes.js';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// En-têtes de sécurité. "cross-origin" est indispensable : le front (port 3000)
// charge les fichiers audio servis par le back (port 4000).
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
    res.send('Welcome to Harmonia Backend!');
});

app.use('/playlists', playlistsRouter);
app.use('/tracks', tracksRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter); // route d'envoi (POST)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // fichiers audio (lecture)

// 404 pour toute route inconnue
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});

// Gestion centralisée des erreurs (en dernier)
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: status === 500 ? 'Server error.' : err.message,
    });
});

export default app;

