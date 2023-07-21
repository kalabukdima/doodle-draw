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


export type ServerToClientEvents = {
    init: (params: InitParams) => void;
    new_pos: (pos: Position) => void;
};

export type ClientToServerEvents = {
    stop: () => void;
    left: () => void;
    right: () => void;
    up: () => void;
    down: () => void;
}
