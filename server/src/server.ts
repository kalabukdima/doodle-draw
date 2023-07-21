import { ClientToServerEvents, ServerToClientEvents } from "@lib/events";
import socketio from 'socket.io';


const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const io = new socketio.Server<ClientToServerEvents, ServerToClientEvents>({
  cors: {
    origin: "*",
  },
  serveClient: false,
});

setInterval(() => {
  io.emit("new_pos", { x: Math.random(), y: Math.random() });
}, 1000);

type MapValue<T> = T extends Map<any, infer V> ? V : never;
type Socket = MapValue<typeof io.sockets.sockets>;

let clientA: Socket | undefined;
let clientB: Socket | undefined;

io.on('connection', (socket) => {
  if (!clientA) {
    clientA = socket;
    clientA.emit("init", { pos: { x: 0, y: 0 }, allowed: [] });
  } else if (!clientB) {
    clientB = socket;
    clientB.emit("init", { pos: { x: 0, y: 0 }, allowed: [] });
  } else {
    console.error("Too many clients connected");
    return;
  }
})

io.listen(port);
console.log(`Socket.IO server running at http://localhost:${port}/`);