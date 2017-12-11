
const mongo = require('mongodb').MongoClient;
var express = require('express');
var http = require('http');

// App setup
var app = express();
var server = http.createServer(app);

// Static files
app.use(express.static('public'));

const client = require('socket.io').listen(server);

server.listen(3000);

// Connect to Mongo
mongo.connect('mongodb://127.0.0.1/chat-app', (err, db) => {
  if(err) {
    throw err;
  }
  console.log('MongoDB connected..')

  // Socket.io connection
  client.on('connection', (socket) => {
    let chat = db.collection('chats');

    // Emit status
    sendStatus = (s) => {
      socket.emit('status', s);
    }

    // Get chats from Mongo collection
    chat.find().limit(100).sort({_id:1}).toArray((err, res)=>{
      if(err){
        throw err;
      }
      // Emit messages
      socket.emit('output', res);
    });

    // Handle input events
    socket.on('input', (data) => {
      let name = data.name;
      let message = data.message;

      // Check valid name and msg
      if(message == '' || name == ''){
        // send error status
        sendStatus('Please enter name and message');
      } else {
        // Insert message to db
        chat.insert({name: name, message: message}, () => {
          client.emit('output', [data]);

          // send status object
          sendStatus({
            message: 'Message Sent',
            clear: true
          });
        });
      }
    });

    //Handle Clear Event
    socket.on('clear', (data) => {
      //Remove all chats from collection
      chat.remove({}, () =>{
        //Emit cleared
        socket.emit('cleared');
      });
    });

  });

});
