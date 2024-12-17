import dotenv from 'dotenv';
import express from 'express';
import playlistsRouter from './routes/playlistRoutes.js'; // Add .js for ES modules

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Harmonia Backend!');
});

app.use('/playlists', playlistsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
