var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);
var path=require("path")

server.listen(3000);

// routing
app.get('/', function (req, res) {

  res.sendFile(path.resolve(__dirname,".","page","index.html"));
});

var usernames = {};
var rooms = ['room1', 'room2', 'room3'];

var allClients = [];
var fullDataRoom = {};

io.sockets.on('connection', function(socket) {
  allClients.push(socket);


  //Everything we do in here is related to socket connections
  //socket is the user, we can communicate with it from here.
    socket.on('addUser', function(username){
      //When the client emits an add user, we perform that functionality
      socket.username = username;
      console.log(username + "Connected");

      //tell the user to join the default room
      socket.room = rooms[0];
      //save the user
      usernames[username] = username;
      //physically join the player and it's socket to the room
      socket.join(socket.room);

      //emit, to the client, you've connected
      updateClient(socket, username, socket.room);

      //emit to the room, a person has connected
      //socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', username + ' has connected');
      updateChatRoom(socket, 'connected');
      updateRoomList(socket, socket.room,fullDataRoom);


    });

    socket.on('disconnect', function() {
      console.log('Got disconnect!');
      console.log(socket.username)
      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
    });


    //take in the message, emit it
    socket.on('sendChat', function (data) {
        //send the message to everyone
        console.log(socket.username + " sent a message");
        console.log("room "+socket.room);
        if(!fullDataRoom[socket.room]){
          fullDataRoom[socket.room]=[]
        }
        fullDataRoom[socket.room].push({username:socket.username,data:data})
        io.sockets.in(socket.room).emit('updateChat', socket.username, data);
    })
    //when we switch a room
    socket.on('switchRoom', function(newRoom) {
        socket.leave(socket.room);
        socket.join(newRoom);
        //update client
        updateClient(socket, socket.username, newRoom);
        //update old room
        updateChatRoom(socket, 'disconnected');
        //change room
        socket.room = newRoom;
        //update new room
        updateChatRoom(socket, 'connected');
        updateRoomList(socket, socket.room,fullDataRoom);
    })

    socket.on('addRoom', function(newRoom) {
      rooms.push("room"+(rooms.length+1));
      io.emit('updateRooms',rooms, socket.room,fullDataRoom);
    });

    //disconnecting from a room
    socket.on('diconnect', function() {
        // remove the user from global list
        delete usernames[socket.username];
        // tell the user list on the client side
        io.sockets.emit('updateUsers', usernames);
        //tell everyone\
        updateGlobal(socket, 'disonnected');
        //leave channel
        socket.leave(socket.room);
    })


});
//update single client with this.
function updateClient(socket, username, newRoom) {
    // socket.emit('updateChat', 'SERVER', 'You\'ve connected to '+ newRoom);
}

function updateRoomList(socket, currentRoom ,fullDataRoom) {
    console.log(fullDataRoom);
    socket.emit('updateRooms', rooms, currentRoom,fullDataRoom);
}

//We will use this function to update the chatroom when a user joins or leaves
function updateChatRoom(socket, message) {
    // socket.broadcast.to(socket.room).emit('updateChat', 'SERVER', socket.username + ' has ' + message);
}
//We will use this function to update everyone!
function updateGlobal(socket, message) {
    // socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has ' + message);
}
