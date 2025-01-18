import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Track from '../models/Track.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const uploadRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = path.join(__dirname, '../uploads');
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Allow only admins to upload tracks
uploadRouter.post('/', authMiddleware, adminMiddleware, upload.single('audio'), async (req, res) => {
    try {
        const { title, artist, duration } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Audio file is required.' });
        }

        const newTrack = new Track({
            title,
            artist,
            duration,
            filePath: req.file.path,
            uploadedBy: req.user.id, // Track admin uploader
        });

        await newTrack.save();

        res.status(201).json({ success: true, data: newTrack });
    } catch (error) {
        console.error('Error uploading track:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default uploadRouter;

