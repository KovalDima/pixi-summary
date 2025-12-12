import { type Container, type FederatedPointerEvent, type IPointData, Sprite, Graphics } from "pixi.js";
import { type SpriteService } from "../../services/SpriteService";
import type { SoundService } from "../../services/SoundService";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SnappingService } from "../../services/SnappingService";
import { type DomEventHelper } from "../../helpers/DomEventHelper";
import type { IPlacementStrategy } from "./IPlacementStrategy";
import { TowerPlacementStrategy } from "./TowerPlacementStrategy";
import { RoadblockPlacementStrategy } from "./RoadblockPlacementStrategy";
import type { TTowerConfig } from "../towers/TowerTypes";
import type { TBoosterConfig } from "../boosters/BoosterTypes";
import type { TowerManager } from "../towers/TowerManager";
import type { BoosterManager } from "../boosters/BoosterManager";

export enum PlaceableItemType {
    TOWER = "tower",
    BOOSTER = "booster",
}

export type TTowerItem = {
    type: PlaceableItemType.TOWER,
    config: TTowerConfig,
    iconAlias: string,
}

export type TBoosterItem = {
    type: PlaceableItemType.BOOSTER,
    config: TBoosterConfig,
    iconAlias: string,
}

export type TPlaceableItem = TTowerItem | TBoosterItem;

export class ObjectPlacementController {
    private readonly gameContainer: Container;
    private readonly towerManager: TowerManager;
    private readonly boosterManager: BoosterManager;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly domEventHelper: DomEventHelper;
    private readonly snappingService: SnappingService;

    private ghostSprite: Sprite | null = null;
    private activeStrategy: IPlacementStrategy | null = null;
    private isValidPlacement: boolean = false;

    private readonly VALID_TINT = 0xFFFFFF;
    private readonly INVALID_TINT = 0xFF0000;
    private readonly ghostConfig = {
        scale: 0.14,
        alpha: 0.5
    };

    constructor(
        gameContainer: Container,
        towerManager: TowerManager,
        boosterManager: BoosterManager,
        spriteService: SpriteService,
        domEventHelper: DomEventHelper,
        soundService: SoundService
    ) {
        this.gameContainer = gameContainer;
        this.towerManager = towerManager;
        this.boosterManager = boosterManager;
        this.spriteService = spriteService;
        this.soundService = soundService;
        this.domEventHelper = domEventHelper;
        this.snappingService = new SnappingService();
    }

    public startPlacing(item: TPlaceableItem, globalPosition: IPointData) {
        this.cancelPlacing();
        this.activeStrategy = this.createStrategy(item);

        if (item.type === PlaceableItemType.TOWER) {
            this.towerManager.highlightAvailableSlots();
        } else if (item.type === PlaceableItemType.BOOSTER) {
            this.boosterManager.highlightAvailableNodes();
        }

        this.createGhost(item, globalPosition);
        this.enableListeners();
        this.updateGhostPosition(this.gameContainer.toLocal(globalPosition));
    }

    private createStrategy(item: TPlaceableItem): IPlacementStrategy {
        switch (item.type) {
            case PlaceableItemType.TOWER:
                return new TowerPlacementStrategy(this.towerManager, this.snappingService, item.config);
            case PlaceableItemType.BOOSTER:
                return new RoadblockPlacementStrategy(this.boosterManager, this.snappingService);
            default:
                throw new Error("Unknown placement type");
        }
    }

    private createGhost(item: TPlaceableItem, globalPosition: IPointData) {
        const localPosition = this.gameContainer.toLocal(globalPosition);

        this.ghostSprite = this.spriteService.createSprite(item.iconAlias);
        this.ghostSprite.alpha = this.ghostConfig.alpha;
        this.ghostSprite.scale.set(this.ghostConfig.scale);
        this.ghostSprite.position.copyFrom(localPosition);

        if (item.type === PlaceableItemType.TOWER) {
            const range = item.config.range;
            const rangeGraphics = new Graphics();
            const alpha = 0.5;

            this.ghostSprite.anchor.set(0.5, 0.75);
            rangeGraphics.beginFill(0xFFFFFF, alpha);
            rangeGraphics.drawCircle(0, 0, range);
            rangeGraphics.endFill();
            rangeGraphics.scale.set(1 / this.ghostConfig.scale);
            rangeGraphics.pivot.set(0, 30);

            this.ghostSprite.addChild(rangeGraphics);
        }

        this.gameContainer.addChild(this.ghostSprite);
    }

    private onGhostMove(event: FederatedPointerEvent) {
        if (!this.ghostSprite || !this.activeStrategy) {
            return;
        }
        const localPosition = this.gameContainer.toLocal(event.global);
        this.updateGhostPosition(localPosition);
    }

    private updateGhostPosition(localPosition: IPointData) {
        if (!this.ghostSprite || !this.activeStrategy) {
            return;
        }

        const placementResult = this.activeStrategy.handleMove(localPosition);

        this.ghostSprite.position.copyFrom(placementResult.position);
        this.isValidPlacement = placementResult.isValid;
        this.ghostSprite.tint = this.isValidPlacement ? this.VALID_TINT : this.INVALID_TINT;
    }

    private onPlace() {
        if (!this.ghostSprite || !this.activeStrategy) {
            return;
        }

        if (this.isValidPlacement) {
            this.activeStrategy.place(this.ghostSprite.position);
            this.cancelPlacing();
        } else {
            this.soundService.play(AssetsConstants.SOUND_FAIL_BUILD);
        }
    }

    public cancelPlacing() {
        this.removeGhost();
        this.activeStrategy = null;
        this.isValidPlacement = false;
        this.towerManager.hideHighlights();
        this.boosterManager.hideHighlights();
        this.disableListeners();
    }

    private removeGhost() {
        this.ghostSprite?.destroy();
        this.ghostSprite = null;
    }

    private enableListeners() {
        this.gameContainer.on("pointermove", this.onGhostMove, this);
        this.gameContainer.on("pointerup", this.onPlace, this);
        this.gameContainer.on("pointerdown", this.onRightMouseClick, this);
        this.domEventHelper.on("keydown", this.onKeyDown, this);
    }

    private disableListeners() {
        this.gameContainer.off("pointermove", this.onGhostMove, this);
        this.gameContainer.off("pointerup", this.onPlace, this);
        this.gameContainer.off("pointerdown", this.onRightMouseClick, this);
        this.domEventHelper.off("keydown", this.onKeyDown, this);
    }

    private onRightMouseClick(event: FederatedPointerEvent) {
        const rightMouseBtn = 2;
        if (event.button === rightMouseBtn) {
            this.cancelPlacing();
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            this.cancelPlacing();
        }
    }
}