import * as socketio from "socket.io-client";
import { Position, Direction, InitParams, ClientToServerEvents, ServerToClientEvents } from "@lib/events";

type Socket = socketio.Socket<ServerToClientEvents, ClientToServerEvents>;

const URL = process.env["API_URL"] ?? "http://localhost:3000";

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
        this.lastPos = { x: params.pos.x, y: params.pos.y };
    }

    onNewPos(data: Position) {
        const newPos = { x: data.x * 800, y: data.y * 800 };
        this.context.beginPath();
        this.context.moveTo(this.lastPos.x, this.lastPos.y);
        this.context.lineTo(newPos.x, newPos.y);
        this.context.stroke();
        this.lastPos = newPos;
    }

    onMovement(direction: Direction) {
        this.socket.emit(direction);
    }

    onStopMovement() {
        this.socket.emit("stop");
    }
}

function run() {
    console.log("Connecting to", URL);
    const socket: Socket = socketio.io(URL);

    const canvas = document.querySelector("canvas")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d")!;
    context.lineWidth = 3;

    let state: State = new UninitializedState();

    socket.on("init", (params: InitParams) => {
        console.log("initialized");
        state = new ActiveState(socket, context, params);
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
