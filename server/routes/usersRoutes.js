import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Playlist from '../models/Playlist.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const usersRouter = express.Router();

const isObjectId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const normalizeEmail = (email) => email.trim().toLowerCase();

// Ne renvoie jamais le hash du mot de passe
const publicUser = (user) => {
    const { password, __v, ...rest } = user.toObject();
    return rest;
};

usersRouter.param('id', (req, res, next, id) => {
    if (!isObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    next();
});

// 1- Profil de l'utilisateur connecté (déclaré AVANT /:id)
usersRouter.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, user: publicUser(user) });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
    }
});

// 2- Liste de tous les utilisateurs (admin uniquement : elle contient les emails)
usersRouter.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password -__v').sort({ _id: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
});

// 3- Un utilisateur par ID (lui-même ou un admin)
usersRouter.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User with ID ${id} not found.` });
        }
        res.status(200).json({ success: true, user: publicUser(user) });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user.' });
    }
});

// 4- Modifier son propre compte (le rôle ne peut jamais être modifié ici)
usersRouter.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, email, password, currentPassword } = req.body;

    if (req.user.id !== id) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only update your own account.' });
    }

    if (name !== undefined && !isNonEmptyString(name)) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }
    if (email !== undefined && !isNonEmptyString(email)) {
        return res.status(400).json({ success: false, message: 'Email cannot be empty.' });
    }
    if (password !== undefined) {
        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }
        if (typeof currentPassword !== 'string' || !currentPassword) {
            return res.status(400).json({ success: false, message: 'Current password is required to set a new one.' });
        }
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User with ID ${id} not found.` });
        }

        if (name !== undefined) user.name = name.trim();

        if (email !== undefined) {
            const cleanEmail = normalizeEmail(email);
            if (cleanEmail !== user.email) {
                const taken = await User.exists({ email: cleanEmail, _id: { $ne: id } });
                if (taken) {
                    return res.status(400).json({ success: false, message: 'This email is already in use.' });
                }
                user.email = cleanEmail;
            }
        }

        if (password !== undefined) {
            const matches = await bcrypt.compare(currentPassword, user.password);
            if (!matches) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
            }
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ success: true, message: 'User updated successfully.', user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'This email is already in use.' });
        }
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Failed to update user.' });
    }
});

// 5- Supprimer un compte (le sien, ou n'importe lequel pour un admin)
usersRouter.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.id !== id) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own account.' });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User with ID ${id} not found.` });
        }

        // On empêche de supprimer le dernier administrateur
        if (user.role === 'admin') {
            const admins = await User.countDocuments({ role: 'admin' });
            if (admins <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot delete the last admin.' });
            }
        }

        await Playlist.deleteMany({ createdBy: user._id }); // pas de playlists orphelines
        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }
});

export default usersRouter;