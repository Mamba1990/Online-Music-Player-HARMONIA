import express from 'express';
import Playlist from '../models/Playlist.js'; // Import the Playlist model

const playlistsRouter = express.Router();

// 1. Fetch all playlists
playlistsRouter.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find(); // Fetch all playlists from MongoDB
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Fetch a specific playlist by ID
playlistsRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const playlist = await Playlist.findById(id); // Find playlist by ID
        if (!playlist) {
            return res.status(404).json({ message: `Playlist with ID ${id} not found.` });
        }
        res.json(playlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Create a new playlist
playlistsRouter.post('/', async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required.' });
    }

    try {
        const newPlaylist = new Playlist({ name, description }); // Create a new playlist instance
        await newPlaylist.save(); // Save playlist to the database
        res.status(201).json(newPlaylist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Update an existing playlist by ID
playlistsRouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const playlist = await Playlist.findById(id); // Find playlist by ID
        if (!playlist) {
            return res.status(404).json({ message: `Playlist with ID ${id} not found.` });
        }

        if (name) playlist.name = name;
        if (description) playlist.description = description;

        await playlist.save(); // Save the updated playlist
        res.json({ message: `Playlist with ID ${id} has been updated.`, playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Delete a playlist by ID
playlistsRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const playlist = await Playlist.findByIdAndDelete(id); // Delete playlist by ID
        if (!playlist) {
            return res.status(404).json({ message: `Playlist with ID ${id} not found.` });
        }
        res.json({ message: `Playlist with ID ${id} has been deleted.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default playlistsRouter;
