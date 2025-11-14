import { type IPointData } from "pixi.js";

export class GameConstants {
    public static readonly FLAME_POSITIONS: IPointData[] = [
        { x: 295, y: 190 },
        { x: 765, y: 230 },
        { x: 205, y: 350 },
        { x: 830, y: 605 },
        { x: 435, y: 695 },
    ];

    // TODO:
    // coords for tower positions
    // public static readonly TOWER_PLATFORM_POSITIONS: IPointData[] = [
    //     { x: 297, y: 165 },
    //     { x: 765, y: 203 },
    //     { x: 204, y: 320 },
    //     { x: 830, y: 576 },
    //     { x: 435, y: 665 },
    // ];
    // public static readonly TOWER_SNAP_DISTANCE = 35;
}