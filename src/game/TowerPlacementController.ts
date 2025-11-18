import {type Container, type FederatedPointerEvent, type IPointData, Sprite} from "pixi.js";
import { type SpriteService } from "../services/SpriteService";
import { type EntityManager } from "./EntityManager";
import { GameConstants } from "../constants/GameConstants";
import { TowerRegistry } from "./towers/TowerRegistry";
import type { TTowerConfig } from "./towers/TowerTypes";

export class TowerPlacementController {
    private readonly gameContainer: Container;
    private readonly entityManager: EntityManager;
    private readonly spriteService: SpriteService;

    private towerButtons: Map<string, Sprite> = new Map();
    private ghostTower: Sprite | null = null;
    private isValidPlacement: boolean = false;
    private readonly VALID_TINT = 0xFFFFFF;
    private readonly INVALID_TINT = 0xFF0000;

    private selectedTowerConfig: TTowerConfig | null = null;
    private readonly ghostTowerConfig = {
        scale: 0.14,
        alpha: 0.5,
        zIndex: 10000,
    };

    constructor(gameContainer: Container, entityManager: EntityManager, spriteService: SpriteService) {
        this.gameContainer = gameContainer;
        this.entityManager = entityManager;
        this.spriteService = spriteService;
    }

    public init() {
        this.addTowerButtons();

        this.gameContainer.on("pointermove", this.onGhostMove, this);
        this.gameContainer.on("pointerdown", this.onPlaceTower, this);
    }

    private addTowerButtons() {
        GameConstants.TOWER_BUTTON_POSITIONS.forEach((buttonData) => {
            const towerConfig = TowerRegistry.getTowerData(buttonData.type);

            if (!towerConfig) {
                throw new Error(`Tower config not found for type: ${buttonData.type}`)
            }

            const towerButton = this.spriteService.createSprite(towerConfig.iconAlias);
            towerButton.position.copyFrom(buttonData.position);
            towerButton.scale.set(GameConstants.TOWER_BUTTON_SCALE);

            towerButton.eventMode = "static";
            towerButton.cursor = "pointer";

            towerButton.on("pointerdown", (e: FederatedPointerEvent) => {
                e.stopPropagation();
                this.startPlacingTower(towerConfig);
            });

            this.gameContainer.addChild(towerButton);
            this.towerButtons.set(towerConfig.type, towerButton);
        })
    }

    private startPlacingTower(config: TTowerConfig) {
        const button = this.towerButtons.get(config.type);

        if (!button) {
            throw new Error(`Tower config not found for type: ${config.type}`);
        }

        this.selectedTowerConfig = config;
        this.ghostTower = this.spriteService.createSprite(config.iconAlias);
        this.ghostTower.position.copyFrom(button.position);
        this.ghostTower.alpha = this.ghostTowerConfig.alpha;
        this.ghostTower.scale.set(this.ghostTowerConfig.scale);
        this.ghostTower.zIndex = this.ghostTowerConfig.zIndex;
        this.ghostTower.tint = this.INVALID_TINT;
        this.isValidPlacement = false;

        this.gameContainer.addChild(this.ghostTower);
    }

    private onGhostMove(e: FederatedPointerEvent) {
        if (!this.ghostTower) {
            return;
        }

        const localPos = this.gameContainer.toLocal(e.global);
        this.ghostTower.position.copyFrom(localPos);

        this.isValidPlacement = this.checkWithinBounds(localPos);
        this.ghostTower.tint = this.isValidPlacement ? this.VALID_TINT : this.INVALID_TINT;
    }

    private onPlaceTower(e: FederatedPointerEvent) {
        if (!this.ghostTower || !this.selectedTowerConfig) {
            return;
        }

        if (this.isValidPlacement) {
            const localPos = this.gameContainer.toLocal(e.global);
            this.entityManager.addTower(this.selectedTowerConfig, localPos);
        }

        this.stopPlacing();
    }

    private stopPlacing() {
        this.ghostTower?.destroy();
        this.ghostTower = null;
        this.selectedTowerConfig = null;
        this.isValidPlacement = false;
    }

    private checkWithinBounds(position: IPointData) {
        const distanceX = position.x - GameConstants.ISLAND_CENTER.x;
        const distanceY = position.y - GameConstants.ISLAND_CENTER.y;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        return distanceSquared <= GameConstants.ISLAND_RADIUS_SQUARED;
    }
}