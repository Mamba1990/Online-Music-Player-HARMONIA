import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

let counter = 0;

export const createUser = async ({ role = 'user' } = {}) => {
    counter += 1;
    const user = await User.create({
        name: `Test ${counter}`,
        email: `user${counter}@test.com`,
        password: await bcrypt.hash('password123', 4), // coût faible = tests rapides
        role,
    });

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
        audience: 'HARMONIA',
        issuer: 'Hafsa Daoudim',
    });

    return { user, token };
};

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });