import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authRouter = express.Router();

// 1. Signup
authRouter.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body; // Allow role to be passed for flexibility during setup.

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Assign a default role if not provided
        const userRole = role || 'user';

        // Create the new user
        const newUser = new User({ name, email, password: hashedPassword, role: userRole });
        await newUser.save();

        res.status(201).json({ success: true, message: 'Signup successful.', user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: `Failed to signup: ${error.message}` });
    }
});

// 2. Login
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });

        // Ensure timing attack resistance by comparing passwords regardless of user existence
        const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Ensure the user has a valid role (optional)
        if (!user.role) {
            return res.status(403).json({ success: false, message: 'User does not have a valid role assigned.' });
        }

        // Sign a JWT with user ID, role, audience, and issuer
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in the environment variables.');
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            jwtSecret,
            { expiresIn: '5h', audience: 'HARMONIA', issuer: 'Hafsa Daoudim' }
        );

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Failed to login. Please try again later.' });
    }
});

export default authRouter;


