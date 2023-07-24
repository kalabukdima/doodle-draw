localStorage.debug = '*';

import * as socketio from "socket.io-client";
import { Position, Direction, InitParams, ClientToServerEvents, ServerToClientEvents } from "@lib/events";

type Socket = socketio.Socket<ServerToClientEvents, ClientToServerEvents>;

const URL = process.env["API_URL"] ?? "http://localhost:3000";

function toViewPos(pos: Position): Position {
    return { x: pos.x * 800, y: pos.y * 800 };
}

interface State {
    onNewPos: (data: Position) => void;
    onMovement: (direction: Direction) => void;
    onStopMovement: () => void;
}

class UninitializedState implements State {
    onNewPos(_data: Position) { }
    onMovement(_direction: Direction) { }
    onStopMovement() { }
}

class ActiveState implements State {
    private allowedMoves: Direction[];
    private lastPos: { x: number, y: number };

    constructor(
        readonly socket: Socket,
        readonly context: CanvasRenderingContext2D,
        params: InitParams,
    ) {
        this.socket = socket;
        this.context = context;
        this.allowedMoves = params.allowed;
        this.lastPos = toViewPos(params.pos);
    }

    onNewPos(pos: Position) {
        const newPos = toViewPos(pos);
        this.context.beginPath();
        this.context.moveTo(this.lastPos.x, this.lastPos.y);
        this.context.lineTo(newPos.x, newPos.y);
        this.context.stroke();
        this.lastPos = newPos;
    }

    onMovement(direction: Direction) {
        this.socket.emit("set_direction", direction);
    }

    onStopMovement() {
        this.socket.emit("set_direction", undefined);
    }
}

let socket: Socket;

function run() {
    console.log("Connecting to", URL);
    socket = socketio.io(URL, {
        transports: ["websocket"],
    });

    const canvas = document.querySelector("canvas")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d")!;
    context.lineWidth = 3;

    let state: State = new UninitializedState();

    socket.emit("join", "the-room", response => {
        if (response.status === "error") {
            return console.error("Couldn't connect to the room:", response.message);
        }
        console.log("Joined room", response.result);
        state = new ActiveState(socket, context, response.result);
    });

    socket.on("new_pos", (data: Position) => {
        state.onNewPos(data);
    })

    document.addEventListener("keydown", (event) => {
        if (event.repeat) {
            return;
        }
        switch (event.key) {
            case "ArrowUp":
                state.onMovement("up");
                break;
            case "ArrowDown":
                state.onMovement("down");
                break;
            case "ArrowLeft":
                state.onMovement("left");
                break;
            case "ArrowRight":
                state.onMovement("right");
                break;
        }
    }, false);

    document.addEventListener("keyup", (_event) => {
        state.onStopMovement();
    }, false);
}

run();
