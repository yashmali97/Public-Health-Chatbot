const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
require('dotenv').config();
console.log(process.env.GEMINI_API_KEY);
const express = require('express');
const cors = require('cors');

const { HealthChatbot } = require('./chatbot');

const app = express();

// Database Connection with Hardened Options
const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of 30s
            socketTimeoutMS: 45000,
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error Details:");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        // Do not exit, allow the server to stay up so we can see errors in logs
    }
};

connectDB();

// Handle connection events
mongoose.connection.on('error', err => {
    console.error('Mongoose runtime error:', err);
});

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
const chatbot = new HealthChatbot();

// Home Route
app.get('/', (req, res) => {
    res.send('Health Chatbot Backend Running');
});

// Health Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK'
    });
});

// Chat Route
app.post('/api/chat', async (req, res) => {

    try {

        const { message } = req.body;

        const reply = await chatbot.chat(message);

        res.json({
            reply
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: 'Server Error'
        });

    }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});