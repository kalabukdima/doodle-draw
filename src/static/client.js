class State {
    onNewPos(_data) {}
    onMovement(_direction) {}
    onStopMovement() {}
}

class UninitializedState extends State {
}

class ActiveState extends State {
    constructor(socket, context, params) {
        super();
        this.socket = socket;
        this.context = context;
        this.allowedMoves = params.allowed;
        this.lastPos = {x: params.pos.x, y: params.pos.y};
    }

    onNewPos(data) {
        const newPos = {x: data.x, y: data.y};
        this.context.beginPath();
        this.context.moveTo(this.lastPos.x, this.lastPos.y);
        this.context.lineTo(newPos.x, newPos.y);
        this.context.stroke();
        this.lastPos = newPos;
    }

    onMovement(direction) {
        this.socket.emit(direction);
    }

    onStopMovement() {
        this.socket.emit("stop");
    }
}

function run() {
    const socket = io();

    const canvas = document.querySelector("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d");
    context.lineWidth = 3;

    let state = new UninitializedState();

    socket.on("init", (params) => {
        console.log("initialized");
        state = new ActiveState(socket, context, params);
    });

    socket.on("new_pos", (data) => {
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
