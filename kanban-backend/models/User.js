const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (this.lockUntil && this.lockUntil > Date.now()) {
        throw new Error('Account is temporarily locked. Try again later.');
    }

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (!isMatch) {
        this.loginAttempts += 1;
        
        if (this.loginAttempts >= 5) {
            this.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        }
        
        await this.save();
        
        if (this.lockUntil) {
            throw new Error('Too many failed attempts. Account is temporarily locked.');
        }
    } else {
        // Reset login attempts on successful login
        if (this.loginAttempts !== 0) {
            this.loginAttempts = 0;
            this.lockUntil = undefined;
            await this.save();
        }
    }

    return isMatch;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

module.exports = mongoose.model('User', userSchema); 