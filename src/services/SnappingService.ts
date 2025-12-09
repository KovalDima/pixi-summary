import type { IPointData } from "pixi.js";

export type TSnappable = {
    id: string;
    position: IPointData;
}

export class SnappingService {
    private readonly SNAP_RADIUS = 30;

    public getClosestTarget(position: IPointData, targets: TSnappable[]) {
        let closestTarget: TSnappable | null = null;
        let minDistance = Infinity;

        for (const target of targets) {
            const distanceX = position.x - target.position.x;
            const distanceY = position.y - target.position.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < this.SNAP_RADIUS && distance < minDistance) {
                minDistance = distance;
                closestTarget = target;
            }
        }

        return closestTarget;
    }
}