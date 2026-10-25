import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET, {
            audience: 'HARMONIA',
            issuer: 'Hafsa Daoudim',
        });
        next();
    } catch (err) {
        const message = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
        res.status(401).json({ success: false, message });
    }
};

export default authMiddleware;

