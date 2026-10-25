import express from 'express';
import Playlist from '../models/Playlist.js';
import Track from '../models/Track.js';
import authMiddleware from '../middleware/authMiddleware.js';

const playlistsRouter = express.Router();

const isObjectId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

// Un ID invalide dans l'URL renvoie 400 au lieu de planter en 500
playlistsRouter.param('id', (req, res, next, id) => {
    if (!isObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid playlist ID.' });
    }
    next();
});

// Seul le créateur ou un admin peut modifier ou supprimer une playlist
const canModify = (playlist, user) =>
    user.role === 'admin' || playlist.createdBy?.toString() === String(user.id);

// Vérifie que "tracks" est une liste d'IDs de morceaux existants
const parseTrackIds = async (tracks) => {
    if (tracks === undefined) return { ids: undefined };
    if (!Array.isArray(tracks) || !tracks.every(isObjectId)) {
        return { error: 'tracks must be an array of valid track IDs.' };
    }
    const ids = [...new Set(tracks)];
    const found = await Track.countDocuments({ _id: { $in: ids } });
    if (found !== ids.length) return { error: 'One or more tracks do not exist.' };
    return { ids };
};

// 1- Liste des playlists
playlistsRouter.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().sort({ _id: -1 });
        res.status(200).json({ success: true, data: playlists });
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch playlists.' });
    }
});

// 2- Une playlist avec ses morceaux
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
        res.status(500).json({ success: false, message: 'Failed to fetch playlist.' });
    }
});

// 3- Créer une playlist (utilisateur connecté)
playlistsRouter.post('/', authMiddleware, async (req, res) => {
    const { name, description, tracks } = req.body;

    if (!isNonEmptyString(name)) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ success: false, message: 'Description must be a string.' });
    }

    try {
        const { ids, error } = await parseTrackIds(tracks);
        if (error) return res.status(400).json({ success: false, message: error });

        const newPlaylist = new Playlist({
            name: name.trim(),
            description,
            tracks: ids || [],
            createdBy: req.user.id,
        });
        await newPlaylist.save();
        res.status(201).json({ success: true, data: newPlaylist });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to create playlist.' });
    }
});

// 4- Modifier une playlist (créateur ou admin)
playlistsRouter.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, description, tracks } = req.body;

    if (name !== undefined && !isNonEmptyString(name)) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }
    if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({ success: false, message: 'Description must be a string.' });
    }

    try {
        const playlist = await Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }

        if (!canModify(playlist, req.user)) {
            return res.status(403).json({ success: false, message: 'You do not have permission to update this playlist.' });
        }

        const { ids, error } = await parseTrackIds(tracks);
        if (error) return res.status(400).json({ success: false, message: error });

        if (name !== undefined) playlist.name = name.trim();
        if (description !== undefined) playlist.description = description; // "" permet d'effacer
        if (ids !== undefined) playlist.tracks = ids;

        await playlist.save();
        res.status(200).json({ success: true, message: `Playlist with ID ${id} has been updated.`, data: playlist });
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to update playlist.' });
    }
});

// 5- Supprimer une playlist (créateur ou admin)
playlistsRouter.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const playlist = await Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: `Playlist with ID ${id} not found.` });
        }

        if (!canModify(playlist, req.user)) {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this playlist.' });
        }

        await playlist.deleteOne();
        res.status(200).json({ success: true, message: `Playlist with ID ${id} has been deleted.` });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ success: false, message: 'Failed to delete playlist.' });
    }
});

export default playlistsRouter;