var http = require('http');
var fs = require('fs');
var path = require( 'path' );

var socketPort=9001;
var serverPort=9000;



var client=require("socket.io").listen(socketPort).sockets;

client.on("connection",function(socket){
  socket.on("input",function(data){
    console.log(data) ;
    client.emit("output",data);
  });
});


http.createServer(function(req, res){
    var pathHTML= path.resolve( __dirname, '..','server', 'page', 'index.html' );
    console.log(pathHTML);
    fs.readFile(pathHTML,function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
}).listen(serverPort);

console.log("Port socket is "+socketPort);
console.log("Port server is "+serverPort);
console.log("localhost:"+serverPort);
