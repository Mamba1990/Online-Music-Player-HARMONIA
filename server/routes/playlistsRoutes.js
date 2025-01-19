import express from 'express';
import Playlist from '../models/Playlist.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const playlistsRouter = express.Router();

// 1- Fetching  all playlists (public)
playlistsRouter.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find();
        res.status(200).json({ success: true, data: playlists });
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ success: false, message: `Failed to fetch playlists: ${error.message}` });
    }
});

// 2- Fetching a specific playlist by ID
playlistsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const playlist = await Playlist.findById(id).populate('tracks');
        if (!playlist) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, data: playlist });
    } catch (error) {
        console.error('Error fetching playlist by ID:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3- Creating a new playlist (only authenticated users)
playlistsRouter.post('/', authMiddleware, async (req, res) => {
    const { name, description, tracks } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    try {
        const newPlaylist = new Playlist({
            name,
            description,
            tracks,
            createdBy: req.user.id, // Linking the playlist to the creator
        });
        await newPlaylist.save();
        res.status(201).json({ success: true, data: newPlaylist });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4- Updating an existing playlist by ID

playlistsRouter.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, description, tracks } = req.body;

    try {
        const playlist = await Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }

        if (req.user.role !== 'admin' && (!playlist.userId || playlist.userId.toString() !== req.user.id.toString())) {
            return res.status(403).json({ success: false, message: 'You do not have permission to update this playlist.' });
        }

        if (name) playlist.name = name;
        if (description) playlist.description = description;
        if (tracks) playlist.tracks = tracks;

        await playlist.save();
        res.status(200).json({ success: true, message: `Playlist with ID ${id} has been updated.`, data: playlist });
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// 5- Deleting a playlist by ID
playlistsRouter.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const playlist = await Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }

        if (req.user.role !== 'admin' && (!playlist.userId || playlist.userId.toString() !== req.user.id.toString())) {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this playlist.' });
        }

        await Playlist.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: `Playlist with ID ${id} has been deleted.` });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default playlistsRouter;
