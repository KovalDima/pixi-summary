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
    public static readonly TOWER_MAX_SCALE = 0.18;

    public static readonly UI_ELEMENT_SCALE = 0.15;
    public static readonly TOWER_BUTTON_POSITIONS: { type: TowerType, position: IPointData }[] = [
        {
            type: TowerType.REGULAR_TOWER,
            position: { x: 50, y: 950 },
        },
        {
            type: TowerType.ARCHER_TOWER,
            position: { x: 160, y: 950 },
        }
    ];

    public static readonly BOOSTER_BUTTON_POSITIONS: { type: BoosterType, position: IPointData }[] = [
        {
            type: BoosterType.ROADBLOCK,
            position: { x: 900, y: 950 },
        },
    ];

    public static readonly ISLAND_CENTER: IPointData = { x: 520, y: 460 };
    public static readonly ISLAND_RADIUS = 410;
    public static readonly ISLAND_RADIUS_SQUARED = this.ISLAND_RADIUS * this.ISLAND_RADIUS;
}