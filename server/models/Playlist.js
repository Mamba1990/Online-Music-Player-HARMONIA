import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
