import express from 'express';
import Playlist from '../models/Playlist.js'; // Import the Playlist model

const playlistsRouter = express.Router();

// 1. Fetch all playlists
playlistsRouter.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('tracks');
        res.status(200).json({ success: true, data: playlists });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Fetch a specific playlist by ID
playlistsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const playlist = await Playlist.findById(id).populate('tracks');
        if (!playlist) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, data: playlist });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Add a debug log 
playlistsRouter.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('tracks');
        console.log('Fetched playlists:', playlists); // Debug log
        res.status(200).json({ success: true, data: playlists });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Create a new playlist
playlistsRouter.post('/', async (req, res) => {
    const { name, description, tracks } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    try {
        const newPlaylist = new Playlist({ name, description, tracks });
        await newPlaylist.save();
        res.status(201).json({ success: true, data: newPlaylist });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Update an existing playlist by ID
playlistsRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, tracks } = req.body;

    try {
        const playlist = await Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }

        if (name) playlist.name = name;
        if (description) playlist.description = description;
        if (tracks) playlist.tracks = tracks;

        await playlist.save();
        res.status(200).json({ success: true, message: `Playlist with ID ${id} has been updated.`, data: playlist });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Delete a playlist by ID
playlistsRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const playlist = await Playlist.findByIdAndDelete(id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, message: `Playlist with ID ${id} has been deleted.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default playlistsRouter;

