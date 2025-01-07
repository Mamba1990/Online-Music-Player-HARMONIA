import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Track from '../models/Track.js';

const uploadRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = path.join(__dirname, '../uploads'); // Relative to server directory
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

uploadRouter.post('/', upload.single('audio'), async (req, res) => {
    try {
        const { title, artist, duration } = req.body;
        const newTrack = new Track({
            title,
            artist,
            duration,
            filePath: req.file.path,
        });
        await newTrack.save();
        res.status(201).json({ success: true, data: newTrack });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default uploadRouter;
