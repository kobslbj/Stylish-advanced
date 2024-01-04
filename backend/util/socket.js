const { Server } = require('socket.io');
const http = require('http');
let io;

const socketConnection = (app) => {
    const server = http.createServer(app);
    io = new Server(server, {
        cors: {
            origin: '*',
        },
    });
    io.on('connection', (socket) => {
        console.info(`Client connected [id=${socket.id}]`);
        socket.join(socket.request._query.id);
        socket.on('disconnect', () => {
            console.info(`Client disconnected [id=${socket.id}]`);
        });
    });

    const streamIo = new Server(server, {
        transports: ['websocket', 'polling'],
        secure: true,
        path: '/video',
    });
    streamIo.on('connection', (socket) => {
        console.log('A user connected');
        // Join Room
        socket.on('join', (room) => {
            socket.join(room);
            socket.to(room).emit('viewer', socket.id);
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

    return server;
};

const changeSecKillNumber = (productName, remain) => {
    io.emit('changeSecKillNumber', { productName, remain });
};

module.exports = {
    socketConnection,
    changeSecKillNumber,
};
