const { Server } = require('socket.io');

function setUpVideoSocket(server) {
    const io = new Server(server, {
        transports: ['websocket', 'polling'],
        secure: true,
        path: '/video',
    });
    io.on('connection', (socket) => {
        console.log('A user connected');
        // Join Room
        socket.on('join', (room) => {
            socket.join(room);
            socket.to(room).emit('viewer', socket.id);
        });
        // Transport Offer
        socket.on('offer', (room, desc) => {
            socket.to(room).emit('offer', desc, socket.id);
        });
        // Transport Answer
        socket.on('answer', (room, desc) => {
            socket.to(room).emit('answer', desc);
        });
        // Exchange ice candidate
        socket.on('ice_candidate', (room, data) => {
            socket.to(room).emit('ice_candidate', data, socket.id);
            socket.to(room).emit('test', data, socket.id);
        });
        socket.on('chat message', (room, msg) => {
            socket.to(room).emit('chat message', msg);
        });
        // Disconnect
        socket.on('disconnect', () => {
            console.log(socket.id, 'disconnect');
            io.emit('leave', socket.id);
        });
    });
}
module.exports = { setUpVideoSocket };
