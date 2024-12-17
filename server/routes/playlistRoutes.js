import express from 'express';

const playlistsRouter = express.Router();

// In-memory storage for demo purposes
let playlists = [
    { id: 1, name: 'Chill Vibes', description: 'Relaxing music to calm your mind.' },
    { id: 2, name: 'Workout Mix', description: 'Upbeat tracks to power your workouts.' },
    { id: 3, name: 'Top Hits', description: 'The latest and greatest hits.' },
];

// GET all playlists
playlistsRouter.get('/', (req, res) => {
    res.json(playlists);
});

// GET a specific playlist by ID
playlistsRouter.get('/:id', (req, res) => {
    const playlistId = parseInt(req.params.id, 10);
    const playlist = playlists.find(p => p.id === playlistId);

    if (playlist) {
        res.json(playlist);
    } else {
        res.status(404).send(`Playlist with ID ${playlistId} not found.`);
    }
});

// POST to create a new playlist
playlistsRouter.post('/', (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).send('Name is required.');
    }

    const newPlaylist = {
        id: playlists.length + 1,
        name,
        description: description || '',
    };

    playlists.push(newPlaylist);
    res.status(201).json(newPlaylist);
});

// PUT to update a specific playlist by ID
playlistsRouter.put('/:id', (req, res) => {
    const playlistId = parseInt(req.params.id, 10);
    const { name, description } = req.body;

    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) {
        return res.status(404).send(`Playlist with ID ${playlistId} not found.`);
    }

    // Update playlist details
    playlist.name = name || playlist.name;
    playlist.description = description || playlist.description;

    res.json(playlist);
});

// DELETE a playlist by ID
playlistsRouter.delete('/:id', (req, res) => {
    const playlistId = parseInt(req.params.id, 10);
    const playlistIndex = playlists.findIndex(p => p.id === playlistId);

    if (playlistIndex === -1) {
        return res.status(404).send(`Playlist with ID ${playlistId} not found.`);
    }

    // Remove the playlist
    playlists.splice(playlistIndex, 1);
    res.status(200).send(`Playlist with ID ${playlistId} has been deleted.`);
});

export default playlistsRouter;

