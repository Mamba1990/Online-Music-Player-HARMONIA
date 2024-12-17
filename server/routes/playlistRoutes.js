import express from 'express';

const playlistsRouter = express.Router();

playlistsRouter.get('/', (req, res) => {
    res.send('Fetching all playlists...');
});

playlistsRouter.post('/', (req, res) => {
    res.send('Creating a new playlist...');
});

export default playlistsRouter;
