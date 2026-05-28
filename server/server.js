require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db/pool');
const authRoutes = require('./routes/auth');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: 'https://chatapp-steel-eta.vercel.app' }
});

app.use(cors({ origin: 'https://chatapp-steel-eta.vercel.app' }));

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

app.get('/messages', async (req, res) => {
    const room = req.query.room || 'general';
    const result = await pool.query(
        `SELECT messages.*, users.username
        FROM messages
        JOIN users ON messages.sender_id = users.id
        WHERE messages.room = $1
        ORDER BY messages.created_at ASC LIMIT 100`,
        [room]
    );
    res.json(result.rows);
});

io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('leave_room', (room) => {
        socket.leave(room);
    })

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

socket.on('send_message', async ({ userId, username, content, room }) => {
    await pool.query(
        'INSERT INTO messages (sender_id, content, room) VALUES ($1, $2, $3)',
        [userId, content, room]
    );
    io.to(room).emit('receive_message', {username, content, room });
});

socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(4000, () => console.log('Server running on http://localhost:4000'));
