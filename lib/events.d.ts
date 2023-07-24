export type Position = {
    // coords in 0..1 range
    x: number;
    y: number;
};

export type Direction = "right" | "left" | "up" | "down";

export type InitParams = {
    allowed: Direction[];
    pos: Position;
};

export type Result<T> = {
    status: "ok";
    result: T;
} | {
    status: "error";
    message: string;
};


export type ServerToClientEvents = {
    new_pos: (pos: Position) => void;
};

export type ClientToServerEvents = {
    join: (room: string, callback: (response: Result<InitParams>) => void) => void;
    set_direction: (dir: Direction | undefined) => void;
}
