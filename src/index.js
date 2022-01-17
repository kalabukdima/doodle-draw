const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const port = process.env.PORT || 3000;

const staticPath = path.join(__dirname, '/static');

app.get('/', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'))
});
app.get('/client.js', (req, res) => {
  res.sendFile(path.join(staticPath, 'client.js'))
});
app.get('/client.css', (req, res) => {
  res.sendFile(path.join(staticPath, 'client.css'))
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

setInterval(() => {
  io.emit("coords", {"x": Math.random(), "y": Math.random()})
}, 1000);

let clientA = null;
let clientB = null;


io.on('connection', (socket) => {
  if (clientA == null) {
    clientA = socket;
  } else if (clientB == null) {
    clientB = socket;
  } else {
    return;
  }



})
