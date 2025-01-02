import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token using your secret
        req.user = decoded; // Attach user data to the request
        next(); // Continue to the next middleware or route
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
};

export default authMiddleware;