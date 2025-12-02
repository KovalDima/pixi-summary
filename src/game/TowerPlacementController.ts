import {type Container, type FederatedPointerEvent, type IPointData, Sprite} from "pixi.js";
import { type SpriteService } from "../services/SpriteService";
import { type EntityManager } from "./EntityManager";
import { GameConstants } from "../constants/GameConstants";
import { TowerRegistry } from "./towers/TowerRegistry";
import type { TTowerConfig } from "./towers/TowerTypes";
import { type DomEventHelper } from "../helpers/DomEventHelper";
import type { SoundService } from "../services/SoundService";
import { AssetsConstants } from "../constants/AssetsConstants";

export class TowerPlacementController {
    private readonly gameContainer: Container;
    private readonly entityManager: EntityManager;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly domEventHelper: DomEventHelper;

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

    constructor(
        gameContainer: Container,
        entityManager: EntityManager,
        spriteService: SpriteService,
        domEventHelper: DomEventHelper,
        soundService: SoundService
    ) {
        this.gameContainer = gameContainer;
        this.entityManager = entityManager;
        this.spriteService = spriteService;
        this.soundService = soundService;
        this.domEventHelper = domEventHelper;
        this.createTowerButtons();
    }

    private startTowerPlacing(event: FederatedPointerEvent, button: Sprite, config: TTowerConfig) {
        event.stopPropagation();
        if (this.ghostTower) {
            this.removeGhost();
        }
        this.createGhostTower(config, button);
        this.onGhostMove(event);
        this.enableTowerPlacingListeners();
    }

    private createTowerButtons() {
        GameConstants.TOWER_BUTTON_POSITIONS.forEach((buttonData) => {
            const towerConfig = TowerRegistry.getTowerData(buttonData.type);

            if (!towerConfig) {
                throw new Error(`Tower config not found for type: ${buttonData.type}`);
            }

            const towerButton = this.spriteService.createSprite(towerConfig.iconAlias);
            towerButton.position.copyFrom(buttonData.position);
            towerButton.scale.set(GameConstants.TOWER_BUTTON_SCALE);

            towerButton.eventMode = "static";
            towerButton.cursor = "pointer";

            towerButton.on("pointerdown", () => {
                towerButton.once("pointerup", (event) => {
                    this.soundService.play(AssetsConstants.SOUND_CLICK);
                    this.startTowerPlacing(event, towerButton, towerConfig);
                });
            });

            this.gameContainer.addChild(towerButton);
            this.towerButtons.set(towerConfig.type, towerButton);
        })
    }

    private createGhostTower(config: TTowerConfig, button: Sprite) {
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

    private onGhostMove(event: FederatedPointerEvent) {
        if (!this.ghostTower) {
            return;
        }

        const localPosition = this.gameContainer.toLocal(event.global);

        this.ghostTower.position.copyFrom(localPosition);
        this.isValidPlacement = this.checkWithinBounds(localPosition);
        this.ghostTower.tint = this.isValidPlacement ? this.VALID_TINT : this.INVALID_TINT;
    }

    private onCancelTowerPlacing(event: FederatedPointerEvent) {
        const rightMouseBtn = 2;
        if (event.button === rightMouseBtn) {
            this.cancelTowerPlacing();
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            this.cancelTowerPlacing();
        }
    }

    private onTowerPlace(event: FederatedPointerEvent) {
        if (!this.ghostTower || !this.selectedTowerConfig) {
            return;
        }

        if (this.isValidPlacement) {
            const localPosition = this.gameContainer.toLocal(event.global);
            this.entityManager.addTower(this.selectedTowerConfig, localPosition);
            this.cancelTowerPlacing();
        } else {
            this.soundService.play(AssetsConstants.SOUND_FAIL_BUILD);
        }
    }

    private cancelTowerPlacing() {
        this.removeGhost();
        this.disableTowerPlacingListeners();
        this.isValidPlacement = false;
    }

    private removeGhost() {
        this.ghostTower?.destroy();
        this.ghostTower = null;
    }

    private checkWithinBounds(position: IPointData) {
        const distanceX = position.x - GameConstants.ISLAND_CENTER.x;
        const distanceY = position.y - GameConstants.ISLAND_CENTER.y;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        return distanceSquared <= GameConstants.ISLAND_RADIUS_SQUARED;
    }

    private enableTowerPlacingListeners() {
        this.gameContainer.on("pointermove", this.onGhostMove, this);
        this.gameContainer.on("pointerup", this.onTowerPlace, this);
        this.gameContainer.on("pointerdown", this.onCancelTowerPlacing, this);
        this.domEventHelper.on("keydown", this.onKeyDown, this);
    }

    private disableTowerPlacingListeners() {
        this.gameContainer.off("pointermove", this.onGhostMove, this);
        this.gameContainer.off("pointerup", this.onTowerPlace, this);
        this.gameContainer.off("pointerdown", this.onCancelTowerPlacing, this);
        this.domEventHelper.off("keydown", this.onKeyDown, this);
    }
}