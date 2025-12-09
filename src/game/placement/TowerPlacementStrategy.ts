import type { IPointData } from "pixi.js";
import { GameConstants } from "../../constants/GameConstants";
import type { EntityManager } from "../EntityManager";
import type { TTowerConfig } from "../towers/TowerTypes";
import type { IPlacementStrategy, TPlacementResult } from "./IPlacementStrategy";

export class TowerPlacementStrategy implements IPlacementStrategy {
    private readonly entityManager: EntityManager;
    private readonly config: TTowerConfig;

    constructor(entityManager: EntityManager, config: TTowerConfig) {
        this.entityManager = entityManager;
        this.config = config;
    }

    public handleMove(localPosition: IPointData): TPlacementResult {
        const distanceX = localPosition.x - GameConstants.ISLAND_CENTER.x;
        const distanceY = localPosition.y - GameConstants.ISLAND_CENTER.y;
        const isWithinIsland = (distanceX * distanceX + distanceY * distanceY) <= GameConstants.ISLAND_RADIUS_SQUARED;

        return {
            position: localPosition,
            isValid: isWithinIsland
        };
    }

    public place(position: IPointData) {
        this.entityManager.addTower(this.config, position);
    }
}