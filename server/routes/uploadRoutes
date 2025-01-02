import express from 'express';
import multer from 'multer';
import path from 'path';
import Track from '../models/Track.js';

const uploadRouter = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

uploadRouter.post('/', upload.single('audio'), async (req, res) => {
    try {
        const { title, artist, album, duration } = req.body;
        const newTrack = new Track({
            title,
            artist,
            album,
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
