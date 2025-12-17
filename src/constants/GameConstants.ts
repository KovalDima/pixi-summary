import { TowerType } from "../game/towers/TowerTypes";
import { BoosterType } from "../game/boosters/BoosterTypes";

export class GameConstants {
    public static readonly DEPTH_MIN_Y = 100;
    public static readonly DEPTH_MAX_Y = 750;
    public static readonly TOWER_MIN_SCALE = 0.14;
    public static readonly TOWER_MAX_SCALE = 0.155;

    public static readonly UI_ELEMENT_SCALE = 0.1;
    public static readonly TOWER_BUTTONS: TowerType[] = [TowerType.REGULAR_TOWER, TowerType.ARCHER_TOWER];
    public static readonly BOOSTER_BUTTONS: BoosterType[] = [BoosterType.ROADBLOCK];

    public static readonly PLAYER_MAX_HP = 20;
}