import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const usersRouter = express.Router();

// 3. Protected route for user profile
// User profile endpoint
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
// fetsh all user (general routes)
usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



// 2. Fetch a specific user by ID (protected route)
usersRouter.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: `User with ID ${id} not found.` });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch user: ${error.message}` });
    }
});



// 4. Create a new user (admin functionality, secured)
usersRouter.post('/', authMiddleware, async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error) {
        res.status(500).json({ error: `Failed to create user: ${error.message}` });
    }
});

// 7. Update an existing user by ID (protected route)
usersRouter.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: `User with ID ${id} not found.` });
        }

        // Update only provided fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        res.status(200).json({ message: 'User updated successfully.', user });
    } catch (error) {
        res.status(500).json({ error: `Failed to update user: ${error.message}` });
    }
});

// 8. Delete a user by ID (protected route)
usersRouter.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: `User with ID ${id} not found.` });
        }
        res.status(200).json({ message: 'User deleted successfully.', user });
    } catch (error) {
        res.status(500).json({ error: `Failed to delete user: ${error.message}` });
    }
});

export default usersRouter;