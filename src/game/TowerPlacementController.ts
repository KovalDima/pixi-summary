import {type Container, type FederatedPointerEvent, Sprite} from "pixi.js";
import { type SpriteService } from "../services/SpriteService";
import { type EntityManager } from "./EntityManager";
import { AssetsConstants } from "../constants/AssetsConstants";

export class TowerPlacementController {
    private readonly gameContainer: Container;
    private readonly entityManager: EntityManager;
    private readonly spriteService: SpriteService;

    private towerButton: Sprite | null = null;
    private ghostTower: Sprite | null = null;

    private readonly uiTowerConfig = {
        x: 50,
        y: 950,
        scale: 0.16,
    };
    private readonly ghostTowerConfig = {
        scale: 0.14,
        alpha: 0.5,
    };


    constructor(gameContainer: Container, entityManager: EntityManager, spriteService: SpriteService) {
        this.gameContainer = gameContainer;
        this.entityManager = entityManager;
        this.spriteService = spriteService;
    }

    public init() {
        this.createTowerButton();

        this.gameContainer.on("pointermove", this.onGhostMove, this);
        this.gameContainer.on("pointerdown", this.onPlaceTower, this);

        if (this.towerButton) {
            this.towerButton.eventMode = "static";
            this.towerButton.cursor = "pointer";
            this.towerButton.on("pointerup", (e: FederatedPointerEvent) => {
                e.stopPropagation();
                this.createGhostTower();
            });
        }
    }

    private createTowerButton() {
        this.towerButton = this.spriteService.createSprite(AssetsConstants.TOWER_1_ALIAS);
        this.towerButton.position.set(this.uiTowerConfig.x, this.uiTowerConfig.y);
        this.towerButton.scale.set(this.uiTowerConfig.scale);

        this.gameContainer.addChild(this.towerButton);
    }

    private createGhostTower() {
        this.ghostTower = this.spriteService.createSprite(AssetsConstants.TOWER_1_ALIAS);
        this.ghostTower.position.set(this.towerButton?.x, this.towerButton?.y);
        this.ghostTower.alpha = this.ghostTowerConfig.alpha;
        this.ghostTower.scale.set(this.ghostTowerConfig.scale);

        this.gameContainer.addChild(this.ghostTower);
    }

    private onGhostMove(e: FederatedPointerEvent) {
        if (!this.ghostTower) {
            return;
        }

        const localPosition = this.gameContainer.toLocal(e.global);
        this.ghostTower.position.copyFrom(localPosition);
    }

    private onPlaceTower(e: FederatedPointerEvent) {
        if (this.ghostTower) {
            const localPosition = this.gameContainer.toLocal(e.global);
            this.entityManager.addTower(localPosition);
            this.stopPlacing();
        }
    }

    private stopPlacing() {
        this.removeGhost();
    }

    private removeGhost() {
        this.ghostTower?.destroy();
        this.ghostTower = null;
    }
}