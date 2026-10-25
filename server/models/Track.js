import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        artist: { type: String, required: true, trim: true },
        duration: { type: Number, required: true, min: 0 }, // en secondes
        filePath: { type: String, required: true },          // ex. "uploads/xxx.mp3"
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const Track = mongoose.model('Track', trackSchema);

export default Track;