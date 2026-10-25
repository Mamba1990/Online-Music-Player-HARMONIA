import { loginLimiter, signupLimiter } from '../middleware/rateLimiters.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authRouter = express.Router();

// Hash factice : sert à faire un bcrypt.compare même quand l'email n'existe pas
const DUMMY_HASH = bcrypt.hashSync('harmonia-dummy-password', 10);

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const normalizeEmail = (email) => email.trim().toLowerCase();

// 1- Signup
authRouter.post('/signup', signupLimiter, async (req, res) => {
    const { name, email, password } = req.body; // le rôle n'est PAS accepté depuis le client

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    try {
        const cleanEmail = normalizeEmail(email);

        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword,
            role: 'user', // toujours "user" à l'inscription
        });
        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Signup successful.',
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
        });
    } catch (error) {
        // 11000 = doublon d'email (deux inscriptions simultanées)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Failed to signup. Please try again later.' });
    }
});

// 2- Login
authRouter.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email: normalizeEmail(email) });

        // On compare toujours un hash, même si l'utilisateur n'existe pas,
        // pour que le temps de réponse ne révèle pas si l'email est connu
        const isPasswordValid = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

        if (!user || !isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        if (!user.role) {
            return res.status(403).json({ success: false, message: 'User does not have a valid role assigned.' });
        }

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
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Failed to login. Please try again later.' });
    }
});

export default authRouter;