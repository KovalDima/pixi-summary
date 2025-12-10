import type { IPointData } from "pixi.js";
import type { TowerManager } from "../towers/TowerManager";
import type { TTowerConfig } from "../towers/TowerTypes";
import type { IPlacementStrategy, TPlacementResult } from "./IPlacementStrategy";
import type { SnappingService, TSnappable } from "../../services/SnappingService";
import { MapConfig } from "../../configs/MapConfig";

export class TowerPlacementStrategy implements IPlacementStrategy {
    private readonly towerManager: TowerManager;
    private readonly snappingService: SnappingService;
    private readonly config: TTowerConfig;
    private readonly availableSlots: TSnappable[];
    private targetSlotId: string | null = null;

    constructor(towerManager: TowerManager, snappingService: SnappingService, config: TTowerConfig) {
        this.towerManager = towerManager;
        this.snappingService = snappingService;
        this.config = config;

        this.availableSlots = MapConfig.getTowerSlots().filter(
            (slot) => !this.towerManager.isSlotOccupied(slot.id)
        );
    }

    public handleMove(position: IPointData): TPlacementResult {
        const snapped = this.snappingService.getClosestTarget(position, this.availableSlots);
        this.targetSlotId = null;

        if (snapped) {
            this.targetSlotId = snapped.id;
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
        if (this.targetSlotId) {
            this.towerManager.createTower(this.config, position, this.targetSlotId);
        }
    }
}