import express from 'express';
import Track from '../models/Track.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import path from 'path';

const tracksRouter = express.Router();

// 1. Fetch all tracks
tracksRouter.get('/', async (req, res) => {
    try {
        const tracks = await Track.find();
        res.status(200).json({ success: true, data: tracks });
    } catch (error) {
        res.status(500).json({ success: false, message: `Failed to fetch tracks: ${error.message}` });
    }
});

// 2. Fetch a specific track by ID (no authentication required)
tracksRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const track = await Track.findById(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, data: track });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Create a new track (admin only)
tracksRouter.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { title, artist, duration } = req.body;

    if (!title || !artist || !duration) {
        return res.status(400).json({ success: false, message: 'Title, artist, and duration are required.' });
    }

    try {
        const filePath = path.join('http://localhost:4000/uploads', `${title.replace(/\s+/g, '-')}.mp3`);
        const newTrack = new Track({ title, artist, duration, filePath });
        await newTrack.save();
        res.status(201).json({ success: true, data: newTrack });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Update an existing track by ID (admin only)
tracksRouter.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, artist, duration } = req.body;

    try {
        const track = await Track.findById(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }

        if (title) track.title = title;
        if (artist) track.artist = artist;
        if (duration) track.duration = duration;

        await track.save();
        res.status(200).json({ success: true, message: `Track with ID ${id} has been updated.`, data: track });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Delete a track by ID (admin only)
tracksRouter.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const track = await Track.findByIdAndDelete(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, message: `Track with ID ${id} has been deleted.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default tracksRouter;

