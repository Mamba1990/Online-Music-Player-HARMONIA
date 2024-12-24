import express from 'express';
import Track from '../models/Track.js'; // Import the Track model

const tracksRouter = express.Router();

// 1. Fetch all tracks
tracksRouter.get('/', async (req, res) => {
    try {
        const tracks = await Track.find();
        res.status(200).json({ success: true, data: tracks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Fetch a specific track by ID
tracksRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const track = await Track.findById(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, data: track });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Create a new track
tracksRouter.post('/', async (req, res) => {
    const { title, artist, album, duration } = req.body;
    if (!title || !artist || !album || !duration) {
        return res.status(400).json({ success: false, message: 'Title, artist, album, and duration are required.' });
    }

    try {
        const newTrack = new Track({ title, artist, album, duration });
        await newTrack.save();
        res.status(201).json({ success: true, data: newTrack });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Update an existing track by ID
tracksRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, artist, album, duration } = req.body;

    try {
        const track = await Track.findById(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }

        if (title) track.title = title;
        if (artist) track.artist = artist;
        if (album) track.album = album;
        if (duration) track.duration = duration;

        await track.save();
        res.status(200).json({ success: true, message: `Track with ID ${id} has been updated.`, data: track });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Delete a track by ID
tracksRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const track = await Track.findByIdAndDelete(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, message: `Track with ID ${id} has been deleted.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default tracksRouter;

