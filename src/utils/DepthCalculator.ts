import { GameConstants } from "../constants/GameConstants";

export class DepthCalculator {
    public static getTowerScale(y: number) {
        const { DEPTH_MAX_Y, DEPTH_MIN_Y, TOWER_MAX_SCALE, TOWER_MIN_SCALE } = GameConstants;

        const yRange = DEPTH_MAX_Y - DEPTH_MIN_Y;
        const towerScaleRange = TOWER_MAX_SCALE - TOWER_MIN_SCALE;
        const yLimitedByMax = Math.min(DEPTH_MAX_Y, y);
        const yClamped = Math.max(DEPTH_MIN_Y, yLimitedByMax);

        const yDelta = yClamped - DEPTH_MIN_Y;
        const yPercentage = yDelta / yRange;
        const scale = TOWER_MIN_SCALE + (towerScaleRange * yPercentage);

        return scale;
    }
}