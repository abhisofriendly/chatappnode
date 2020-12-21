const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { addUser, removeUser, getUser, getUsersInRoom } = require('../public/users');

const publicDirectory = path.join(__dirname, '../public');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = socketio(server);

app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
    socket.on('join', (options, callback) => {
        const  {error, user} =  addUser({id: socket.id, ...options})
        if(error){
            return callback(error)
        }

        socket.join(user.room);

        socket.emit('massage', 'welcome to chaty');
        socket.broadcast.to(user.room).emit('message', `${user.username} has joined`)
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit

    })

    socket.on('sendmessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('profanity is not allowed')
        }
        io.to(user.room).emit('message', message);
        callback('delivered');
    });
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', `${user.username} has left`)
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    socket.on('location', (lat, long, callback) => {
        const user = getUser(socket.id);
        // console.log(lat,long)
        io.to(user.room).emit('locationmessage', `https://www.google.com/maps?q=${lat},${long}`);
        callback();
    })
})

server.listen(port, () => {
    console.log('server is listening on port 3000')
})