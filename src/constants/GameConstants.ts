import { type IPointData } from "pixi.js";
import { TowerType } from "../game/towers/TowerTypes";
import { BoosterType } from "../game/boosters/BoosterTypes";

export class GameConstants {
    public static readonly FLAME_POSITIONS: IPointData[] = [
        { x: 295, y: 190 },
        { x: 765, y: 230 },
        { x: 205, y: 350 },
        { x: 830, y: 605 },
        { x: 435, y: 695 },
    ];

    public static readonly DEPTH_MIN_Y = 100;
    public static readonly DEPTH_MAX_Y = 750;
    public static readonly TOWER_MIN_SCALE = 0.14;
    public static readonly TOWER_MAX_SCALE = 0.155;

    public static readonly UI_ELEMENT_SCALE = 0.14;
    public static readonly TOWER_BUTTONS: TowerType[] = [TowerType.REGULAR_TOWER, TowerType.ARCHER_TOWER];

    public static readonly BOOSTER_BUTTON_POSITIONS: { type: BoosterType, position: IPointData }[] = [
        {
            type: BoosterType.ROADBLOCK,
            position: { x: 900, y: 950 },
        },
    ];

    public static readonly PLAYER_MAX_HP = 20;
}