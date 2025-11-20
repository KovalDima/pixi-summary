import { GameConstants } from "../constants/GameConstants";

export class DepthCalculator {
    private static readonly Y_RANGE = GameConstants.DEPTH_MAX_Y - GameConstants.DEPTH_MIN_Y;
    private static readonly SCALE_RANGE = GameConstants.TOWER_MAX_SCALE - GameConstants.TOWER_MIN_SCALE;

    public static getTowerScale(y: number) {
        const clampedY = Math.max(GameConstants.DEPTH_MIN_Y, Math.min(GameConstants.DEPTH_MAX_Y, y));
        const yDelta = clampedY - GameConstants.DEPTH_MIN_Y;
        const percentage = yDelta / this.Y_RANGE;
        const scale = GameConstants.TOWER_MIN_SCALE + (this.SCALE_RANGE * percentage);
        return scale;
    }
}