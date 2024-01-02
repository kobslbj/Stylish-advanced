const { Server } = require('socket.io');
const http = require('http');
let io;

const socketConnection = (app) => {
    const server = http.createServer(app);
    io = new Server(server, {
        cors: {
            origin: '*',
        }
    });
    io.on('connection', (socket) => {
        console.info(`Client connected [id=${socket.id}]`);
        socket.join(socket.request._query.id);
        socket.on('disconnect', () => {
            console.info(`Client disconnected [id=${socket.id}]`);
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