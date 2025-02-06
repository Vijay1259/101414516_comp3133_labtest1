require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json()); // Ensures JSON requests are properly parsed
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Socket.io logic
io.on('connection', (socket) => {
    console.log(' New user connected');

    socket.on('joinRoom', (room) => {
        if (room) {
            socket.join(room);
            console.log(`🔹 User joined room: ${room}`);
            socket.to(room).emit('message', { message: `A new user joined ${room}` });
        } else {
            console.log(" Join Room Error: No room specified");
        }
    });

    socket.on('chatMessage', (data) => {
        if (data.room && data.message) {
            io.to(data.room).emit('message', data);
            console.log(` Message in ${data.room}: ${data.message}`);
        } else {
            console.log(" Chat Message Error: Missing room or message");
        }
    });

    socket.on('disconnect', () => {
        console.log(' User disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
