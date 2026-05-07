const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log('Auth Middleware - Received Authorization Header:', authHeader);
        
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            console.log('Auth Middleware - No token extracted from header');
            return res.status(401).json({ success: false, message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth Middleware - Verification Error:', err.message);
        res.status(401).json({ success: false, message: 'Token verification failed, authorization denied' });
    }
};

module.exports = auth;
