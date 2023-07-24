import { Direction, InitParams, Position } from "@lib/events";
import { Socket } from "./types";
import { strict as assert } from "assert";

function dist(a: Position, b: Position): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export class Room {
    private static moves: Direction[][] = [["up", "down"], ["left", "right"]];
    private static speed = 0.002;
    private static maxSlots = 2;
    private sockets: (Socket | undefined)[] = new Array(Room.maxSlots);
    private points: Position[] = [{ x: 0.5, y: 0.5 }];

    constructor(
        readonly id: string,
    ) { }

    public add(socket: Socket): InitParams {
        const slot = this.insert(socket);
        const moves = Room.moves[slot];

        socket.on("disconnect", reason => {
            this.sockets[slot] = undefined;
        });

        socket.on("set_direction", dir => {
            socket.data.dir = undefined;
            if (dir && moves.includes(dir)) {
                socket.data.dir = dir;
            }
        });

        socket.join(this.networkId());

        setImmediate(() => {
            for (const pos of this.points) {
                socket.emit("new_pos", pos);
            }
        });

        assert(this.points.length > 0);
        return { allowed: moves, pos: this.points[0] };
    }

    public tick() {
        const [dx, dy] = this.currentDirection();
        assert(this.points.length > 0);
        const curPos = this.points[this.points.length - 1];
        const newPos = { x: curPos.x + dx * Room.speed, y: curPos.y + dy * Room.speed };
        if (dist(curPos, newPos) > 1e-7) {
            this.points.push(newPos);
            this.onNewPos(newPos);
        }
    }

    private onNewPos(pos: Position) {
        for (const socket of this.sockets) {
            socket?.volatile.emit("new_pos", pos);
        }
    }

    public lastPos(): Position {
        assert(this.points.length > 0);
        return this.points[this.points.length - 1];
    }

    public networkId(): string {
        return `room:${this.id}`;
    }

    private insert(socket: Socket): number {
        for (let i = 0; i < Room.maxSlots; ++i) {
            if (this.sockets[i] === undefined || !this.sockets[i]?.connected) {
                this.sockets[i] = socket;
                return i;
            }
        }
        throw new Error(`room ${this.id} is already full`);
    }

    private currentDirection(): [number, number] {
        let dx = 0;
        let dy = 0;
        for (let i = 0; i < Room.maxSlots; ++i) {
            if (this.sockets[i]) {
                switch (this.sockets[i]?.data.dir) {
                    case "up":
                        dy -= 1;
                        break;
                    case "down":
                        dy += 1;
                        break;
                    case "left":
                        dx -= 1;
                        break;
                    case "right":
                        dx += 1;
                        break;
                }
            }
        }
        return [dx, dy];
    }
}
