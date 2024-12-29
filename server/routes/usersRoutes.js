import express from 'express';
import User from '../models/User.js'; // Import the User model

const usersRouter = express.Router();

// 1. Fetch all users
usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch users: ${error.message}` });
    }
});

// 2. Fetch a specific user by ID
usersRouter.get('/:id', async (req, res) => {
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

// Log added to validate reponses
usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.find();
        console.log('Fetched users:', users); // Debug log
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Create a new user
usersRouter.post('/', async (req, res) => {
    const { name, email, password } = req.body; // Add 'password' if required
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error) {
        res.status(500).json({ error: `Failed to create user: ${error.message}` });
    }
});

// 4. Update an existing user by ID
usersRouter.put('/:id', async (req, res) => {
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
        if (password) user.password = password;

        await user.save();
        res.status(200).json({ message: 'User updated successfully.', user });
    } catch (error) {
        res.status(500).json({ error: `Failed to update user: ${error.message}` });
    }
});

// 5. Delete a user by ID
usersRouter.delete('/:id', async (req, res) => {
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




