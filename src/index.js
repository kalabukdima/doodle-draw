const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server);
const path = require('path');

const port = process.env.PORT || 3000;

const staticPath = "static";

app.get('/', (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"), { root: path.join(__dirname, "..") });
});
app.use(express.static(staticPath));

server.listen(port, () => {
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
