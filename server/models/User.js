import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'user'], default: 'user' },
        // Photo de profil : petite image (data URL) stockée en base, pour survivre aux redémarrages de Render
        avatar: { type: String, default: '' },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
