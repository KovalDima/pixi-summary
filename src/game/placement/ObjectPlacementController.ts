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
import type { EconomyService } from "../../services/EconomyService";

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
    private readonly rootContainer: Container;
    private readonly towerManager: TowerManager;
    private readonly boosterManager: BoosterManager;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly domEventHelper: DomEventHelper;
    private readonly snappingService: SnappingService;
    private readonly economyService: EconomyService;

    private ghostSprite: Sprite | null = null;
    private activeStrategy: IPlacementStrategy | null = null;
    private currentItem: TPlaceableItem | null = null;
    private isValidPlacement: boolean = false;

    private readonly VALID_TINT = 0xFFFFFF;
    private readonly INVALID_TINT = 0xFF0000;
    private readonly ghostConfig = {
        scale: 0.14,
        alpha: 0.6
    };

    constructor(
        gameContainer: Container,
        rootContainer: Container,
        towerManager: TowerManager,
        boosterManager: BoosterManager,
        spriteService: SpriteService,
        domEventHelper: DomEventHelper,
        soundService: SoundService,
        economyService: EconomyService
    ) {
        this.gameContainer = gameContainer;
        this.rootContainer = rootContainer;
        this.towerManager = towerManager;
        this.boosterManager = boosterManager;
        this.spriteService = spriteService;
        this.soundService = soundService;
        this.domEventHelper = domEventHelper;
        this.economyService = economyService;
        this.snappingService = new SnappingService();
    }

    public startPlacing(item: TPlaceableItem, globalPosition: IPointData) {
        this.cancelPlacing();
        this.currentItem = item;
        this.activeStrategy = this.createStrategy(item);

        if (item.type === PlaceableItemType.TOWER) {
            this.towerManager.highlightAvailableSlots();
        } else if (item.type === PlaceableItemType.BOOSTER) {
            this.boosterManager.highlightAvailableNodes();
        }

        this.createGhost(item, globalPosition);
        this.enableListeners();
        this.processMove(globalPosition);
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
        this.ghostSprite = this.spriteService.createSprite(item.iconAlias);
        this.ghostSprite.alpha = this.ghostConfig.alpha;
        this.ghostSprite.scale.set(this.ghostConfig.scale);
        this.ghostSprite.position.copyFrom(globalPosition);

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

        this.rootContainer.addChild(this.ghostSprite);
    }

    private onGhostMove(event: FederatedPointerEvent) {
        if (!this.ghostSprite || !this.activeStrategy) {
            return;
        }
        this.processMove(event.global);
    }

    private processMove(globalPosition: IPointData) {
        if (!this.ghostSprite || !this.activeStrategy) {
            return;
        }

        const localGamePosition = this.gameContainer.toLocal(globalPosition);
        const placementResult = this.activeStrategy.handleMove(localGamePosition);

        this.isValidPlacement = placementResult.isValid;
        this.ghostSprite.tint = this.isValidPlacement ? this.VALID_TINT : this.INVALID_TINT;

        const finalGlobalPos = this.gameContainer.toGlobal(placementResult.position);

        this.ghostSprite.position.copyFrom(finalGlobalPos);

        const currentMapScale = this.gameContainer.scale.x;
        this.ghostSprite.scale.set(this.ghostConfig.scale * currentMapScale);
    }

    private onPlace(event: FederatedPointerEvent) {
        if (!this.ghostSprite || !this.activeStrategy) {
            return;
        }

        this.processMove(event.global);

        if (this.isValidPlacement && this.currentItem) {
            const price = this.currentItem.config.price;
            const isPurchaseSuccessful = this.economyService.spendMoney(price);

            if (isPurchaseSuccessful) {
                const finalGamePos = this.gameContainer.toLocal(this.ghostSprite.position);
                this.activeStrategy.place(finalGamePos);
                this.cancelPlacing();
            } else {
                this.soundService.play(AssetsConstants.SOUND_FAIL_BUILD);
                console.log("Not enough money!");
            }
        } else {
            this.soundService.play(AssetsConstants.SOUND_FAIL_BUILD);
        }
    }

    public cancelPlacing() {
        this.removeGhost();
        this.activeStrategy = null;
        this.currentItem = null;
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
        this.rootContainer.on("pointermove", this.onGhostMove, this);
        this.rootContainer.on("pointerup", this.onPlace, this);
        this.rootContainer.on("pointerdown", this.onRightMouseClick, this);
        this.domEventHelper.on("keydown", this.onKeyDown, this);
    }

    private disableListeners() {
        this.rootContainer.off("pointermove", this.onGhostMove, this);
        this.rootContainer.off("pointerup", this.onPlace, this);
        this.rootContainer.off("pointerdown", this.onRightMouseClick, this);
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