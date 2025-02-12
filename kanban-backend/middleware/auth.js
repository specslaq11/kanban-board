const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth endpoints
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later'
});

exports.protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Please login to access this resource' 
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check token expiration
            if (decoded.exp < Date.now() / 1000) {
                return res.status(401).json({
                    message: 'Token has expired, please login again'
                });
            }

            // Get user from token
            const user = await User.findById(decoded.id)
                .select('-password -resetPasswordToken -resetPasswordExpire');
            
            if (!user) {
                return res.status(401).json({ 
                    message: 'User no longer exists' 
                });
            }

            // Check if user changed password after token was issued
            if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
                return res.status(401).json({
                    message: 'Password recently changed, please login again'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ 
                message: 'Invalid or expired token' 
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
}; 