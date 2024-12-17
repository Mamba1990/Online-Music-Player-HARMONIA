import express from 'express';

const playlistsRouter = express.Router();

// Mock data for playlists
let playlists = [
    { id: 1, name: 'Chill Vibes', description: 'Relaxing music to calm your mind.' },
    { id: 2, name: 'Workout Mix', description: 'Upbeat tracks to power your workouts.' },
    { id: 3, name: 'Top Hits', description: 'Popular tracks for the season.' },
];

let nextId = 4; // ID counter for new playlists

// Fetch all playlists
playlistsRouter.get('/', (req, res) => {
    res.json(playlists);
});

// Fetch a specific playlist by ID
playlistsRouter.get('/:id', (req, res) => {
    const { id } = req.params;
    const playlist = playlists.find((p) => p.id === parseInt(id));
    if (!playlist) {
        return res.status(404).send(`Playlist with ID ${id} not found.`);
    }
    res.json(playlist);
});

// Create a new playlist
playlistsRouter.post('/', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).send('Name and description are required.');
    }
    const newPlaylist = { id: nextId++, name, description };
    playlists.push(newPlaylist);
    res.status(201).json(newPlaylist);
});

// Update an existing playlist
playlistsRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const playlist = playlists.find((p) => p.id === parseInt(id));
    if (!playlist) {
        return res.status(404).send(`Playlist with ID ${id} not found.`);
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    res.json({ message: `Playlist with ID ${id} has been updated.`, playlist });
});

// Delete a playlist by ID
playlistsRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = playlists.findIndex((p) => p.id === parseInt(id));
    if (index === -1) {
        return res.status(404).send(`Playlist with ID ${id} not found.`);
    }
    playlists.splice(index, 1);
    res.send(`Playlist with ID ${id} has been deleted.`);
});

export default playlistsRouter;


