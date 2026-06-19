const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }

}, {
    timestamps: true,
    bufferCommands: false, // Disable buffering for this model
    autoIndex: true
});

module.exports = mongoose.model('User', userSchema);