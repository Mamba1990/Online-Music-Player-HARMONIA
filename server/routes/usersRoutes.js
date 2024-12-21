import express from 'express';
import User from '../models/User.js'; // Import the User model

const usersRouter = express.Router();

// 1. Fetch all users
usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Create a new user
usersRouter.post('/', async (req, res) => {
    const { name, email, password } = req.body; // Add 'password' if required
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        const newUser = new User({ name, email, password }); // Create a new user instance
        await newUser.save(); // Save the user to the database
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save(); // Save the updated user
        res.json({ message: `User with ID ${id} has been updated.`, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.json({ message: `User with ID ${id} has been deleted.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default usersRouter;



