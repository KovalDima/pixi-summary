import type { IPointData } from "pixi.js";
import type { EntityManager } from "../EntityManager";
import { SnappingService, type TSnappable } from "../../services/SnappingService";
import { MapConfig } from "../../configs/MapConfig";
import { PathNodeType } from "../../core/pathfinding/PathfindingTypes";
import type { IPlacementStrategy, TPlacementResult } from "./IPlacementStrategy";

export class RoadblockPlacementStrategy implements IPlacementStrategy {
    private readonly entityManager: EntityManager;
    private readonly snappingService: SnappingService;
    private readonly snapTargets: TSnappable[];
    private targetNodeId: string | null = null;

    constructor(entityManager: EntityManager, snappingService: SnappingService) {
        this.entityManager = entityManager;
        this.snappingService = snappingService;

        const occupiedNodes = this.entityManager.getOccupiedNodes();

        this.snapTargets = MapConfig.getNodes().filter((node) =>
            node.type === PathNodeType.OBSTACLE && !occupiedNodes.has(node.id)
        );
    }

    public handleMove(position: IPointData): TPlacementResult {
        this.targetNodeId = null;

        const snapped = this.snappingService.getClosestTarget(position, this.snapTargets);

        if (snapped) {
            this.targetNodeId = snapped.id;
            return {
                position: snapped.position,
                isValid: true
            };
        }

        return {
            position,
            isValid: false
        };
    }

    public place(position: IPointData) {
        if (this.targetNodeId) {
            this.entityManager.addRoadblock(this.targetNodeId);
        }
    }
}