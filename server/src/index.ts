import socketio from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, Direction } from "@lib/events";
import { Room } from "./room";


const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const io = new socketio.Server<ClientToServerEvents, ServerToClientEvents>({
  cors: {
    origin: "*",
  },
  serveClient: false,
  transports: ["websocket"],
});

const rooms: Map<string, Room> = new Map();

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} has joined. Recovered: ${socket.recovered}`);
  socket.on("join", async (roomId, callback) => {
    try {
      let room = rooms.get(roomId);
      if (room === undefined) {
        room = new Room(roomId);
        rooms.set(roomId, room);
      }
      const result = room.add(socket);
      callback({
        status: "ok",
        result,
      })
    } catch (e) {
      const message = (e as Error).message ?? "unknown error";
      callback({
        status: "error",
        message,
      });
    }
  });
})

setInterval(() => {
  for (const [roomId, room] of rooms) {
    room.tick();
  }
}, 10);

io.listen(port);
console.log(`Socket.IO server running at http://localhost:${port}/`);
