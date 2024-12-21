import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    duration: { type: Number, required: true },
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
});

const Track = mongoose.model('Track', trackSchema);

export default Track;
