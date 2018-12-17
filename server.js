'use strict';

const http = require('http');
const browserify = require('browserify-middleware');
const express = require('express');
const path = require('path');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);
// const ngrok = require('ngrok');

// config
const _port = process.env.PORT || '3030';

// private


app.use(express.static(__dirname + '/client'));

app.get('/:id', (req, res) => {
  res.redirect('/controller/?id=' + req.params.id);
});

// app.get('/js/bundle.js', browserify(['debug', 'lodash', 'socket.io-client', 'simple-peer', {'./client.js': {run: true}}]));
app.get('/js/viewerBundle.js', browserify(['debug', 'socket.io-client', 'simple-peer', {'./client/client.js': {run: true}}]));
app.get('/js/controllerBundle.js', browserify(['debug', 'socket.io-client', 'simple-peer', {'./client/controller/mobileController.js': {run: true}}]));

io.on('connection', function (socket) {
  console.log('Connection with ID:', socket.id);

  socket.on('room', function(room) {
    console.log('joining room ' + room);
    socket.join(room);
    socket.to(room).emit('joined');
  });  

  socket.on('signal', function(data) {
    const socket2 = io.sockets.connected[data.peerId];
    if (!socket2) { return; }
    console.log('Proxying signal from peer %s to %s', socket.id, socket2.id);

    socket2.emit('signal', {
      signal: data.signal,
      peerId: socket.id
    });
  });

  socket.on('go-private', function(connectionId) {
    console.log('going private...');

    // need to emit messages to all clients in the room (should only be 2, really...)

    var clients = Object.keys(io.sockets.adapter.rooms[connectionId].sockets);
    console.log('clients in room ' + connectionId + ': \n', clients);
    if (clients.length > 1) {
      for (let i=0; i<clients.length; i++) {
        console.log('client: %s', clients[i]);
        var clientSocket = io.sockets.connected[clients[i]];

        for(let j=0; j<clients.length; j++) {
          if(j===i) { continue; } // don't emit message to self
          console.log('  ==> client: %s', clients[j]);          
          clientSocket.emit('peer', {
            peerId: clients[j] // send the id of the peer to connect to via WebRTC
          });
        }        
      }
    }


    // ORIGINAL code that doesn't account for multiple rooms (players):
    // const peersToAdvertise = Object.keys(io.sockets.connected);
    // const index = peersToAdvertise.indexOf(socket.id);
    // if (index > -1) {
    //   peersToAdvertise.splice(index, 1);
    // }

    // console.log('advertising peers', peersToAdvertise);

    // if (peersToAdvertise) {
    //   peersToAdvertise.forEach(function(socket2id) {
    //     const socket2 = io.sockets.connected[socket2id];

    //     console.log('socket2.rooms: \n', JSON.stringify(socket2.rooms));

    //     console.log('Advertising peer %s to %s', socket.id, socket2.id);        

    //     socket2.emit('peer', {
    //       peerId: socket.id//,
    //       // initiator: true
    //     });
    //     socket.emit('peer', {
    //       peerId: socket2.id//,
    //       // initiator: false
    //     });
    //   });
    // }
  });
});

server.listen(_port, (err) => {
  if (err) return console.log(`Something bad happened: ${err}`);
  console.log(`Server Listening on PORT ${_port}`);

  // console.log(`Connecting ngrok on port ${_port}`);
  // // const url = await ngrok.connect(_port);
  // // console.log(`local server is publicly-accessible at ${url}`);
  
  // ngrok.connect(_port, function (err, url) {
  //   if (err) {
  //     console.log(`Some error occured with ngrok connect: ${err}`);
  //   }
  //   console.log(`local server is publicly-accessible at ${url}`);
  // });

});

// console.log(`Connecting ngrok on port ${_port}`);
// ngrok.connect(_port, function (err, url) {
//   if (err) {
//     console.log(`Some error occured with ngrok connect: ${err}`);
//   }
//   console.log(`local server is publicly-accessible at ${url}`);
// });

