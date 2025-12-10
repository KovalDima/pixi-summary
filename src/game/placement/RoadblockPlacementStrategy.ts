import type { IPointData } from "pixi.js";
import type { BoosterManager } from "../boosters/BoosterManager";
import { SnappingService, type TSnappable } from "../../services/SnappingService";
import type { IPlacementStrategy, TPlacementResult } from "./IPlacementStrategy";

export class RoadblockPlacementStrategy implements IPlacementStrategy {
    private readonly boosterManager: BoosterManager;
    private readonly snappingService: SnappingService;
    private readonly snapTargets: TSnappable[];
    private targetNodeId: string | null = null;

    constructor(boosterManager: BoosterManager, snappingService: SnappingService) {
        this.boosterManager = boosterManager;
        this.snappingService = snappingService;
        this.snapTargets = this.boosterManager.getAvailableNodes();
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

    public place() {
        if (this.targetNodeId) {
            this.boosterManager.addRoadblock(this.targetNodeId);
        }
    }
}