import express from 'express';
import Track from '../models/Track.js'; // Import the Track model

const tracksRouter = express.Router();

// 1. Fetch all tracks
tracksRouter.get('/', async (req, res) => {
    try {
        const tracks = await Track.find(); // Fetch all tracks from MongoDB
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Fetch a specific track by ID
tracksRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const track = await Track.findById(id); // Find track by ID
        if (!track) {
            return res.status(404).json({ message: `Track with ID ${id} not found.` });
        }
        res.json(track);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Create a new track
tracksRouter.post('/', async (req, res) => {
    const { title, artist, album } = req.body;
    if (!title || !artist || !album) {
        return res.status(400).json({ message: 'Title, artist, and album are required.' });
    }

    try {
        const newTrack = new Track({ title, artist, album }); // Create a new track instance
        await newTrack.save(); // Save the track to the database
        res.status(201).json(newTrack);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Update an existing track by ID
tracksRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, artist, album } = req.body;

    try {
        const track = await Track.findById(id); // Find track by ID
        if (!track) {
            return res.status(404).json({ message: `Track with ID ${id} not found.` });
        }

        if (title) track.title = title;
        if (artist) track.artist = artist;
        if (album) track.album = album;

        await track.save(); // Save the updated track
        res.json({ message: `Track with ID ${id} has been updated.`, track });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Delete a track by ID
tracksRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const track = await Track.findByIdAndDelete(id); // Delete track by ID
        if (!track) {
            return res.status(404).json({ message: `Track with ID ${id} not found.` });
        }
        res.json({ message: `Track with ID ${id} has been deleted.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default tracksRouter;
