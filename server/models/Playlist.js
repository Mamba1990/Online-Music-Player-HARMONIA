import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        // Les playlists existantes restent publiques ; une playlist privée n'est visible que de son propriétaire et des admins
        isPublic: { type: Boolean, default: true },
        // Un like par utilisateur
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
