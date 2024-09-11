import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: [true, 'First name is required'] },
    lastname: { type: String, required: [true, 'Last name is required'] },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[0-9a-zA-Z\W_]{8,}$/, 'Password must be at least 8 characters long, include at least one digit, one lowercase letter, one uppercase letter, and one special character.']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w{2,3})+$/,
        unique: true 
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    simplePrice:{
        type: Number,
        min: [200, 'Simple price must be at least 200'],
        required: [true, 'Simple price is required']
    },
    intermediatePrice:{
        type: Number,
        min: [200, 'intermediate price must be at least 200'],
        required: [true, 'Simple price is required']
    },
    advancePrice:{
        type: Number,
        min: [200, 'Advanced  price must be at least 200'],
        required: [true, 'Simple price is required']
    },
    agreeToTerms: { type: Boolean, required: [true, 'Agreeing to terms is required'] },
    availableTimes: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: [true, 'Day is required']
        },
        slots: [{
            startTime: {
                type: String, // Time format: HH:MM (24-hour format)
                required: [true, 'Start time is required']
            },
            endTime: {
                type: String, // Time format: HH:MM (24-hour format)
                required: [true, 'End time is required']
            }
        }]
    }],

    resetPasswordToken: String,
    resetPasswordExpiredAt: Date,
    verificationToken: String,
    verifiationTokenExpiresAt: Date,
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
