import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true, index: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true, trim: true, maxlength: 500 },
    },
    { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
