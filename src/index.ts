import path from 'path';
import http from 'http';
import express, { Express, Request, Response } from 'express';
import socketio from 'socket.io';


const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const staticPath = "static";

const app: Express = express();
const server = http.createServer(app);

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(staticPath, "index.html"), { root: path.join(__dirname, "..") });
});
app.use(express.static(staticPath));

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


const io = new socketio.Server(server);

setInterval(() => {
  io.emit("new_pos", { "x": Math.random(), "y": Math.random() })
}, 1000);

let clientA: socketio.Socket | undefined;
let clientB: socketio.Socket | undefined;

io.on('connection', (socket) => {
  if (!clientA) {
    clientA = socket;
    clientA.emit("init", { pos: { x: 0, y: 0 } });
  } else if (!clientB) {
    clientB = socket;
    clientB.emit("init", { pos: { x: 0, y: 0 } });
  } else {
    console.error("Too many clients connected");
    return;
  }
})
