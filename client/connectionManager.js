const Peer = require('simple-peer');
const io = require('socket.io-client');
const Dispatcher = require('./utils/dispatcher');
const { DataType, ControlType } = require('./models');
const { IdUtils } = require('./utils/idUtils');

function connectionManager(playerId) {
  let _self = this;

  // public properties
  this.isInitiator = playerId ? false : true; // initiate from desktop, not mobile device
  this.connectionId = playerId || IdUtils.generateId(5);

  // private variables
  let _socket = null;
  let _peers = {};
  let _useTrickle = true;
  let _peerConnection = null;
  const _dispatcher = new Dispatcher();

  // public methods
  this.startConnection = startConnection;
  this.sendOrientationData = sendOrientationData;
  this.sendControlMessage = sendControlMessage;
  this.addListener = addListener;
  this.removeListener = removeListener;
  
  // method definitions
  _init(playerId);
  function _init(playerId) {

    _socket = io.connect();

    _socket.on('connect', function() {
      console.log('Connected to signalling server, Peer ID: %s', _socket.id);
      _socket.emit('room', _self.connectionId);
    });

    _socket.on('joined', function() {
      console.log('Controller joined');
      _dispatcher.dispatch(DataType.CONTROL, ControlType.CONNECTED);
    });

    _socket.on('peer', function(data) { // go private
      var peerId = data.peerId;
      var peer = new Peer({ initiator: _self.isInitiator, trickle: _useTrickle });
      // var peer = new Peer({ initiator: location.hash === '#1', trickle: _useTrickle });
    
      console.log('Peer available for connection discovered from signalling server, Peer ID: %s', peerId);      
    
      _socket.on('signal', function(data) {
        if (data.peerId == peerId) {
          console.log('Received signalling data', data, 'from Peer ID:', peerId);
          peer.signal(data.signal);
        }
      });
    
      // initiator will auto have some signal data to send to others
      peer.on('signal', function(data) {
        console.log('Advertising signalling data', data, 'to Peer ID:', peerId);
        // instead of sending this data to socket, send to http API?
        _socket.emit('signal', {
          playerId: _self.connectionId,
          signal: data,
          peerId: peerId
        });
      });
      peer.on('error', function(e) {
        console.log('Error sending connection to peer %s:', peerId, e);
      });
      peer.on('connect', function() {
        console.log('Peer connection established');
        _dispatcher.dispatch(DataType.CONTROL, ControlType.CALIBRATED);
      });
      peer.on('data', function(data) {
        const string = new TextDecoder("utf-8").decode(data);
        console.log('Recieved data from peer:', string);
        const eventData = JSON.parse(string);
        _dispatcher.dispatch(eventData.type, eventData.data);
      });
      _peers[peerId] = peer;
      _peerConnection = peer;
    });
  }

  function startConnection() {
    _socket.emit('go-private', _self.connectionId);
  }

  function addListener(eventName, callback) {
    _dispatcher.on(eventName, callback);
  }

  function removeListener(eventName, callback) {
    _dispatcher.off(eventName, callback);
  }

  function sendOrientationData(orientation) {
    if (!_peerConnection || (_peerConnection && !_peerConnection.connected)) {
      return;
    }
    
    let data = {
      type: DataType.ORIENTATION,
      data: orientation
    }
    _peerConnection.send(JSON.stringify(data));
  }

  function sendControlMessage(message) {
    if (!_peerConnection) {
      return;
    }

    let data = {
      type: DataType.CONTROL,
      data: ControlType[message]
    }
    _peerConnection.send(JSON.stringify(data));
  }
  
}

module.exports = connectionManager;
