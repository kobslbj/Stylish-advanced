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
        cors: {
            origin: '*',
        },
        path: '/video',
    });
    let streamId;
    streamIo.on('connection', (socket) => {
        console.log('A user connected');
        //send streamId
        socket.on('send streamId', (id) => {
            console.log('receive streamId:', id);
            streamId = id;
            streamIo.emit('receive streamId', id);
        });
        // Join Room
        socket.on('join', (room) => {
            socket.join(room);
            socket.to(room).emit('viewer', socket.id);
            streamId && streamIo.emit('receive streamId', streamId);
        });
        //chat message
        socket.on('chat message', (room, msg) => {
            socket.to(room).emit('chat message', msg);
        });
        // Disconnect
        socket.on('disconnect', () => {
            console.log(socket.id, 'disconnect');
            streamIo.emit('leave', socket.id);
        });
    });

    return server;
};

const changeSecKillNumber = (productId, remain) => {
    io.emit('changeSecKillNumber', { productId, remain });
};

module.exports = {
    socketConnection,
    changeSecKillNumber,
};
