import type { IPointData } from "pixi.js";
import type { TPathNode } from "../core/pathfinding/PathfindingTypes";
import { PathNodeType } from "../core/pathfinding/PathfindingTypes";
import { MapConfig } from "../configs/MapConfig";

// TODO:
//  зробити універсальним (для прилипання буль-яких об'єктів)
export class SnappingService {
    private readonly obstacleNodes: TPathNode[];
    private readonly SNAP_RADIUS = 30;

    constructor() {
        this.obstacleNodes = MapConfig.getNodes().filter(node => node.type === PathNodeType.OBSTACLE);
    }

    public getClosestAvailableNode(position: IPointData, occupiedNodes: Set<string>) {
        let closestNode: TPathNode | null = null;
        let minDistance = Infinity;

        for (const node of this.obstacleNodes) {
            if (occupiedNodes.has(node.id)) {
                continue;
            }

            const distanceX = position.x - node.position.x;
            const distanceY = position.y - node.position.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < this.SNAP_RADIUS && distance < minDistance) {
                minDistance = distance;
                closestNode = node;
            }
        }

        return closestNode;
    }
}