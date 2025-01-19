import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const usersRouter = express.Router();

// 1- Getting user profile (Protected)
usersRouter.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch profile: ${error.message}` });
    }
});

// 2- Getting all users (Public)
usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Excluding passwords
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ success: false, error: `Failed to fetch users: ${error.message}` });
    }
});

// 3- Fetching a specific user by ID (Public)
usersRouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ success: false, message: `User with ID ${id} not found.` });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ success: false, error: `Failed to fetch user: ${error.message}` });
    }
});

// 4- Updating user by ID (Protected - Only the authenticated user can update their account)
usersRouter.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Checking if the authenticated user is the owner of the account
    if (req.user.id !== id) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only update your own account.' });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User with ID ${id} not found.` });
        }

        // Updating fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();
        res.status(200).json({ success: true, message: 'User updated successfully.', user });
    } catch (error) {
        res.status(500).json({ success: false, error: `Failed to update user: ${error.message}` });
    }
});

// 5. Deleting user by ID (Protected - Admin can delete any user, regular users can delete only their account)
usersRouter.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        // Checking if the authenticated user is allowed to delete this account
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only delete your own account.' 
            });
        }

        // Attempting to delete the user
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: `User with ID ${id} not found.` 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'User deleted successfully.', 
            user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: `Failed to delete user: ${error.message}` 
        });
    }
});

export default usersRouter;
