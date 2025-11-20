import {type Container, type FederatedPointerEvent, Sprite} from "pixi.js";
import { type SpriteService } from "../services/SpriteService";
import { type EntityManager } from "./EntityManager";
import { GameConstants } from "../constants/GameConstants";
import { TowerRegistry } from "./towers/TowerRegistry";
import type { TTowerConfig } from "./towers/TowerTypes";
import { type DomEventHelper } from "../helpers/DomEventHelper";

export class TowerPlacementController {
    private readonly gameContainer: Container;
    private readonly entityManager: EntityManager;
    private readonly spriteService: SpriteService;
    private readonly domEventHelper: DomEventHelper;

    private towerButtons: Map<string, Sprite> = new Map();
    private ghostTower: Sprite | null = null;

    private selectedTowerConfig: TTowerConfig | null = null;
    private readonly ghostTowerConfig = {
        scale: 0.14,
        alpha: 0.5,
        zIndex: 10000,
    };


    constructor(
        gameContainer: Container,
        entityManager: EntityManager,
        spriteService: SpriteService,
        domEventHelper: DomEventHelper
    ) {
        this.gameContainer = gameContainer;
        this.entityManager = entityManager;
        this.spriteService = spriteService;
        this.domEventHelper = domEventHelper;
        this.createTowerButtons();
    }

    private onStartTowerPlacing(e: FederatedPointerEvent) {
        e.stopPropagation();
        this.createGhostTower();
    }

    private createTowerButtons() {
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
            towerButton.on("pointerdown", this.enableTowerPlacingListeners, this);

            this.gameContainer.addChild(towerButton);
            this.towerButtons.set(towerConfig.type, towerButton);
        })
    }

    private createGhostTower(config: TTowerConfig) {
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

        this.gameContainer.addChild(this.ghostTower);
    }

    private onGhostMove(e: FederatedPointerEvent) {
        if (!this.ghostTower) {
            return;
        }

        const localPosition = this.gameContainer.toLocal(e.global);
        this.ghostTower.position.copyFrom(localPosition);
    }

    private onCancelTowerPlacing(e: FederatedPointerEvent) {
        const rightMouseBtn = 2;
        if (e.button === rightMouseBtn) {
            this.cancelTowerPlacing();
        }
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            this.cancelTowerPlacing();
        }
    }

    private onTowerPlace(e: FederatedPointerEvent) {
        if (this.ghostTower && this.selectedTowerConfig) {
            const localPosition = this.gameContainer.toLocal(e.global);
            this.entityManager.addTower(this.selectedTowerConfig, localPosition);
            this.removeGhost();
        }
        this.disableTowerPlacingListeners();
    }

    private cancelTowerPlacing() {
        this.removeGhost();
        this.disableTowerPlacingListeners();
    }

    private removeGhost() {
        this.ghostTower?.destroy();
        this.ghostTower = null;
    }

    private enableTowerPlacingListeners() {
        this.towerButton.on("pointerup", this.onStartTowerPlacing, this); // в циклі ?
        this.gameContainer.on("pointermove", this.onGhostMove, this);
        this.gameContainer.on("pointerup", this.onTowerPlace, this);
        this.gameContainer.on("pointerdown", this.onCancelTowerPlacing, this);
        this.domEventHelper.on("keydown", this.onKeyDown, this);
    }

    private disableTowerPlacingListeners() {
        this.towerButton.off("pointerup", this.onStartTowerPlacing, this); // в циклі ?
        this.gameContainer.off("pointermove", this.onGhostMove, this);
        this.gameContainer.off("pointerup", this.onTowerPlace, this);
        this.gameContainer.off("pointerdown", this.onCancelTowerPlacing, this);
        this.domEventHelper.off("keydown", this.onKeyDown, this);
    }
}