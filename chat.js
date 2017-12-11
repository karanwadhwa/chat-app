(function(){
  var element = (id) => {
    return document.getElementById(id);
  }

  // Get Elements
  var status = element('feedback');
  var output = element('output');
  var name = element('name');
  var message = element('message');
  var send = element('send');
  var clear = element('clear');


  // Set default status
  var statusDefault = status.textContent;

  var setStatus = (s) => {
    status.textContent = s;

    if(s != statusDefault){
      var delay = setTimeout(() => {
        setStatus(statusDefault);
      }, 4000);
    }
  }

  // Connect to socket.io
  var socket = io.connect('http://127.0.0.1:4000');

  // Check for connection
  if(socket!==undefined){
    console.log('Connected to Socket...');

    // Get output from server
    socket.on('output', (data) => {
      console.log(data);
      if(data.length) {
        for (var i=0; i<data.length; i++){
          var msg = document.createElement('p');
          msg.setAttribute('class', 'chatMessage');
          var msgName = document.createElement('strong');
          msgName.textContent = data[i].name;
          var msgMessage = document.createTextNode(": "+data[i].message);
          msg.appendChild(msgName);
          msg.appendChild(msgMessage);
          output.appendChild(msg);
          output.insertBefore(msg, output.firstChild);
        }
      }
    });

    // Get Status from server
    socket.on('status', (data) => {
      // display status
      setStatus((typeof data === 'object')? data.message : data);

      // if status.clear=true, clear text
      if(data.clear) {
        message.value = '';
      }
    });

    // Handle Input
    // from enter key
    message.addEventListener('keydown', (event) => {
      if(event.which === 13 && event.shiftKey == false) {
        // Emit to server input
        socket.emit('input', {
          name: name.value,
          message: message.value
        });

        event.preventDefault();
      }
    });
    // from submit button
    send.addEventListener('click', () => {
      // Emit to server input
      socket.emit('input', {
        name: name.value,
        message: message.value
      });

      event.preventDefault();
    });

  }


})();