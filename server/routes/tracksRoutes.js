import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Track from '../models/Track.js';
import Playlist from '../models/Playlist.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const tracksRouter = express.Router();
const UPLOADS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../uploads');

const isObjectId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

tracksRouter.param('id', (req, res, next, id) => {
    if (!isObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid track ID.' });
    }
    next();
});

// 1- Liste des morceaux
tracksRouter.get('/', async (req, res) => {
    try {
        const tracks = await Track.find().sort({ _id: -1 });
        res.status(200).json({ success: true, data: tracks });
    } catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tracks.' });
    }
});

// 2- Un morceau par ID
tracksRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const track = await Track.findById(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, data: track });
    } catch (error) {
        console.error('Error fetching track:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch track.' });
    }
});

// 3- La création passe par POST /upload (fichier audio + métadonnées).
//    L'ancienne route POST /tracks fabriquait un filePath invalide, elle est supprimée.

// 4- Modifier un morceau (admin)
tracksRouter.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, artist, duration } = req.body;

    if (title !== undefined && !isNonEmptyString(title)) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty.' });
    }
    if (artist !== undefined && !isNonEmptyString(artist)) {
        return res.status(400).json({ success: false, message: 'Artist cannot be empty.' });
    }
    if (duration !== undefined && !(Number.isFinite(Number(duration)) && Number(duration) > 0)) {
        return res.status(400).json({ success: false, message: 'Duration must be a positive number.' });
    }

    try {
        const track = await Track.findById(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }

        if (title !== undefined) track.title = title.trim();
        if (artist !== undefined) track.artist = artist.trim();
        if (duration !== undefined) track.duration = Number(duration);

        await track.save();
        res.status(200).json({ success: true, message: `Track with ID ${id} has been updated.`, data: track });
    } catch (error) {
        console.error('Error updating track:', error);
        res.status(500).json({ success: false, message: 'Failed to update track.' });
    }
});

// 5- Supprimer un morceau (admin) : retire aussi le fichier et les références dans les playlists
tracksRouter.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const track = await Track.findByIdAndDelete(id);
        if (!track) {
            return res.status(404).json({ success: false, message: `Track with ID ${id} not found.` });
        }

        await Playlist.updateMany({ tracks: track._id }, { $pull: { tracks: track._id } });

        // path.basename empêche toute sortie du dossier uploads
        const file = path.join(UPLOADS_DIR, path.basename(track.filePath));
        await fs.unlink(file).catch(() => {});

        res.status(200).json({ success: true, message: `Track with ID ${id} has been deleted.` });
    } catch (error) {
        console.error('Error deleting track:', error);
        res.status(500).json({ success: false, message: 'Failed to delete track.' });
    }
});

export default tracksRouter;