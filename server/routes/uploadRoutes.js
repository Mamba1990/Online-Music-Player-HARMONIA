import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Track from '../models/Track.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const uploadRouter = express.Router();
const UPLOADS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 Mo
const ALLOWED_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const removeFile = (file) => file && fs.unlink(file.path, () => {});

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    // Nom généré : on n'utilise jamais le nom d'origine (espaces, caractères spéciaux, collisions)
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomUUID()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (file.mimetype.startsWith('audio/') && ALLOWED_EXTENSIONS.has(ext)) {
            return cb(null, true);
        }
        cb(new Error('Only audio files are allowed (mp3, wav, ogg, flac, m4a, aac).'));
    },
});

// Transforme les erreurs de multer en réponses 400 lisibles
const uploadAudio = (req, res, next) => {
    upload.single('audio')(req, res, (err) => {
        if (!err) return next();
        const message =
            err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 30 MB).' : err.message;
        res.status(400).json({ success: false, message });
    });
};

// Réservé aux admins : l'authentification passe AVANT la réception du fichier
uploadRouter.post('/', authMiddleware, adminMiddleware, uploadAudio, async (req, res) => {
    const { title, artist } = req.body;
    const duration = Number(req.body.duration);

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Audio file is required.' });
    }

    // Si les métadonnées sont invalides, on supprime le fichier déjà enregistré
    if (!isNonEmptyString(title) || !isNonEmptyString(artist) || !Number.isFinite(duration) || duration <= 0) {
        removeFile(req.file);
        return res.status(400).json({
            success: false,
            message: 'Title, artist, and a positive duration (in seconds) are required.',
        });
    }

    try {
        const newTrack = new Track({
            title: title.trim(),
            artist: artist.trim(),
            duration,
            filePath: `uploads/${req.file.filename}`, // chemin relatif, lu par le lecteur du front
            uploadedBy: req.user.id,
        });
        await newTrack.save();

        res.status(201).json({ success: true, data: newTrack });
    } catch (error) {
        removeFile(req.file);
        console.error('Error uploading track:', error);
        res.status(500).json({ success: false, message: 'Failed to upload track.' });
    }
});

export default uploadRouter;