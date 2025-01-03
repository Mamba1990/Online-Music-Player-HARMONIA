import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || 'secret_key');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
};

export default authMiddleware;
