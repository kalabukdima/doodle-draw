import { ClientToServerEvents, ServerToClientEvents } from "@lib/events";
import socketio from "socket.io";

export type Socket = socketio.Socket<ClientToServerEvents, ServerToClientEvents>;
