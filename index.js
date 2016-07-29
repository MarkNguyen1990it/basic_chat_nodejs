var http = require('http');
var fs = require('fs');

var client=require("socket.io").listen(8080).sockets;

client.on("connection",function(socket){
  socket.on("input",function(data){
    console.log(data) ;
    client.emit("output",data);
  });
});


http.createServer(function(req, res){
    fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
}).listen(8000);
