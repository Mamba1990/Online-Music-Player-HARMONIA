import express from 'express';

const tracksRouter = express.Router();

// Mock data for tracks
let tracks = [
    { id: 1, title: 'Track 1', artist: 'Artist 1', album: 'Album 1' },
    { id: 2, title: 'Track 2', artist: 'Artist 2', album: 'Album 2' },
    { id: 3, title: 'Track 3', artist: 'Artist 3', album: 'Album 3' },
];

let nextTrackId = 4; // Counter for the next track ID

// 1. Fetch all tracks
tracksRouter.get('/', (req, res) => {
    res.json(tracks);
});

// 2. Fetch a specific track by ID
tracksRouter.get('/:id', (req, res) => {
    const { id } = req.params;
    const track = tracks.find((t) => t.id === parseInt(id));
    if (!track) {
        return res.status(404).send(`Track with ID ${id} not found.`);
    }
    res.json(track);
});

// 3. Create a new track
tracksRouter.post('/', (req, res) => {
    const { title, artist, album } = req.body;
    if (!title || !artist || !album) {
        return res.status(400).send('Title, artist, and album are required.');
    }

    const newTrack = { id: nextTrackId++, title, artist, album };
    tracks.push(newTrack);
    res.status(201).json(newTrack);
});

// 4. Update an existing track by ID
tracksRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, artist, album } = req.body;

    const track = tracks.find((t) => t.id === parseInt(id));
    if (!track) {
        return res.status(404).send(`Track with ID ${id} not found.`);
    }

    if (title) track.title = title;
    if (artist) track.artist = artist;
    if (album) track.album = album;

    res.json({ message: `Track with ID ${id} has been updated.`, track });
});

// 5. Delete a track by ID
tracksRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = tracks.findIndex((t) => t.id === parseInt(id));
    if (index === -1) {
        return res.status(404).send(`Track with ID ${id} not found.`);
    }

    tracks.splice(index, 1);
    res.send(`Track with ID ${id} has been deleted.`);
});

export default tracksRouter;


