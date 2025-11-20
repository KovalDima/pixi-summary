import {type Container, type FederatedPointerEvent, Sprite} from "pixi.js";
import { type SpriteService } from "../services/SpriteService";
import { type EntityManager } from "./EntityManager";
import { AssetsConstants } from "../constants/AssetsConstants";

export class TowerPlacementController {
    private readonly gameContainer: Container;
    private readonly entityManager: EntityManager;
    private readonly spriteService: SpriteService;

    private towerButton: Sprite;
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
        this.towerButton = this.createTowerButton();

        // зробити observer or signal (observer with context support when callback support)
        // або wrapper над слухачем зі збереженням контексту
        // window or dom Helper.on(3 arg here)
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    public init() {
        this.towerButton.eventMode = "static";
        this.towerButton.cursor = "pointer";
        this.towerButton.on("pointerdown", this.enableTowerPlacingListeners, this);
    }

    private enableTowerPlacingListeners() {
        this.towerButton.on("pointerup", this.onStartTowerPlacing, this);
        this.gameContainer.on("pointermove", this.onGhostMove, this);
        this.gameContainer.on("pointerup", this.onTowerPlace, this);
        this.gameContainer.on("pointerdown", this.onCancelTowerPlacing, this);
        window.addEventListener("keydown", this.onKeyDown);
    }

    private disableTowerPlacingListeners() {
        this.towerButton.removeListener("pointerup", this.onStartTowerPlacing, this);
        this.gameContainer.removeListener("pointermove", this.onGhostMove, this);
        this.gameContainer.removeListener("pointerup", this.onTowerPlace, this);
        this.gameContainer.removeListener("pointerdown", this.onCancelTowerPlacing, this);
        window.removeEventListener("keydown", this.onKeyDown);
    }

    private onStartTowerPlacing(e: FederatedPointerEvent) {
        e.stopPropagation();
        this.createGhostTower();
    }

    private createTowerButton() {
        const towerButton = this.spriteService.createSprite(AssetsConstants.TOWER_1_ALIAS);
        towerButton.position.set(this.uiTowerConfig.x, this.uiTowerConfig.y);
        towerButton.scale.set(this.uiTowerConfig.scale);
        this.gameContainer.addChild(towerButton);
        return towerButton;
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

    private onCancelTowerPlacing(e: FederatedPointerEvent) {
        const rightMouseBtn = 2;
        if (e.button === rightMouseBtn) {
            this.removeGhost();
            this.disableTowerPlacingListeners();
        }
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            this.removeGhost();
            this.disableTowerPlacingListeners();
        }
    }

    private onTowerPlace(e: FederatedPointerEvent) {
        if (this.ghostTower) {
            const localPosition = this.gameContainer.toLocal(e.global);
            this.entityManager.addTower(localPosition);
            this.removeGhost();
        }
        this.disableTowerPlacingListeners();
    }

    private removeGhost() {
        this.ghostTower?.destroy();
        this.ghostTower = null;
    }
}