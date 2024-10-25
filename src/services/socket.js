const socketIo = require('socket.io');

let io;

function initSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',  // Adjust this to your frontend's URL if necessary
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });

        // handle sending notifications
        socket.on('sendNotification', (data) => {
            io.emit('notification', data);
        });

        // handle private messaging
        socket.on('privateMessage', ({ recipientId, message }) => {
            io.to(recipientId).emit('privateMessage', { senderId: socket.id, message });
        });

        // handle joining and leaving rooms
        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log(`User ${socket.id} left room: ${room}`);
        });

        // handle typing events
        socket.on('typing', (room) => {
            socket.to(room).emit('typing', { userId: socket.id });
        });

        socket.on('stopTyping', (room) => {
            socket.to(room).emit('stopTyping', { userId: socket.id });
        });

        // broadcast a message to a specific room
        socket.on('broadcastToRoom', ({ room, message }) => {
            io.to(room).emit('roomMessage', message);
        });

        // error handling
        socket.on('error', (err) => {
            console.error('Socket.IO Error:', err);
        });
    });
}

function sendNotification(notification) {
    if (io) {
        io.emit('notification', notification);
    }
}

module.exports = { initSocket, sendNotification };