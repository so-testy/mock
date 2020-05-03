import socketIO from 'socket.io';

const users = [{
    id: 0,
    name: null,
    socket: null,
    token: '3443fsdflksdjfsfs',
    role: 'admin'
}, {
    id: 1,
    name: null,
    socket: null,
    token: 'sflk4j3lk4j34lk34',
    role: 'user'
}, {
    id: 2,
    name: null,
    socket: null,
    token: '5kn6589h5nh856n5g',
    role: 'user'
}, {
    id: 3,
    name: null,
    socket: null,
    token: 'jg0945jg405gjjlkg',
    role: 'user'
}]

export let io;
export const initSocket = server => {
    io = socketIO(server);

    io.on('connection', socket => {
        console.log('a user connected');

        // authorization
        socket.on('get-profile', token => {
            socket.emit('get-profile', users.find(u => u.token == token));
        });

        // chatting
        socket.on('message', ({ msg, token }) => {
            const user = users.find(u => u.token == token);
            io.sockets.emit('message', {
                msg,
                user,
            });
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}
