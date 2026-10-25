import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
