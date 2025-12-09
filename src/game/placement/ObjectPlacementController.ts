import { type Container, type FederatedPointerEvent, type IPointData, Sprite } from "pixi.js";
import { type SpriteService } from "../../services/SpriteService";
import { type EntityManager } from "../EntityManager";
import type { SoundService } from "../../services/SoundService";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SnappingService } from "../../services/SnappingService";
import { type DomEventHelper } from "../../helpers/DomEventHelper";
import type { IPlacementStrategy } from "./IPlacementStrategy";
import { TowerPlacementStrategy } from "./TowerPlacementStrategy";
import { RoadblockPlacementStrategy } from "./RoadblockPlacementStrategy";
import type { TTowerConfig } from "../towers/TowerTypes";
import type { TBoosterConfig } from "../boosters/BoosterTypes";

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
    private readonly entityManager: EntityManager;
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
        this.snappingService = new SnappingService();
    }

    public startPlacing(item: TPlaceableItem, globalPosition: IPointData) {
        this.cancelPlacing();
        this.activeStrategy = this.createStrategy(item);
        this.createGhost(item.iconAlias, globalPosition);
        this.enableListeners();
        this.updateGhostPosition(this.gameContainer.toLocal(globalPosition));
    }

    private createStrategy(item: TPlaceableItem): IPlacementStrategy {
        switch (item.type) {
            case PlaceableItemType.TOWER:
                return new TowerPlacementStrategy(this.entityManager, item.config);
            case PlaceableItemType.BOOSTER:
                return new RoadblockPlacementStrategy(this.entityManager, this.snappingService);
            default:
                throw new Error("Unknown placement type");
        }
    }

    private createGhost(iconAlias: string, globalPosition: IPointData) {
        const localPosition = this.gameContainer.toLocal(globalPosition);

        this.ghostSprite = this.spriteService.createSprite(iconAlias);
        this.ghostSprite.alpha = this.ghostConfig.alpha;
        this.ghostSprite.scale.set(this.ghostConfig.scale);
        this.ghostSprite.position.copyFrom(localPosition);
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