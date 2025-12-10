import { type Container, type FederatedPointerEvent, type IPointData, Sprite } from "pixi.js";
import { type SpriteService } from "../services/SpriteService";
import { type EntityManager } from "./EntityManager";
import { GameConstants } from "../constants/GameConstants";
import { TowerRegistry } from "./towers/TowerRegistry";
import type { TTowerConfig } from "./towers/TowerTypes";
import { type DomEventHelper } from "../helpers/DomEventHelper";
import type { SoundService } from "../services/SoundService";
import { AssetsConstants } from "../constants/AssetsConstants";
import { SnappingService } from "../services/SnappingService";

export enum PlaceableItemType {
    TOWER = "tower",
    BOOSTER = "booster",
}

export type TPlaceableItem = {
    type: PlaceableItemType,
    config: any,
    iconAlias: string,
}

export class ObjectPlacementController {
    private readonly gameContainer: Container;
    private readonly entityManager: EntityManager;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly domEventHelper: DomEventHelper;
    private readonly snappingService: SnappingService;

    private ghostSprite: Sprite | null = null;
    private selectedItem: TPlaceableItem | null = null;
    private targetNodeId: string | null = null;
    private isValidPlacement: boolean = false;
    private readonly VALID_TINT = 0xFFFFFF;
    private readonly INVALID_TINT = 0xFF0000;
    private readonly ghostConfig = {
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
        this.snappingService = new SnappingService();

        this.initUI();
    }

    private initUI() {
        this.createTowerButtons();
        this.createBoosterButtons();
    }

    private createTowerButtons() {
        GameConstants.TOWER_BUTTON_POSITIONS.forEach((btn) => {
            const config = TowerRegistry.getTowerData(btn.type);

            if (!config) {
                return;
            }

            this.createButton(
                config.iconAlias,
                btn.position,
                (globalPosition: IPointData) => this.startPlacing({
                    type: PlaceableItemType.TOWER,
                    config,
                    iconAlias: config.iconAlias
                }, globalPosition)
            );
        });
    }

    private createBoosterButtons() {
        this.createButton(
            AssetsConstants.ROADBLOCK_BOOSTER_ALIAS,
            GameConstants.ROADBLOCK_BOOSTER_BUTTON_POSITION,
            (globalPosition: IPointData) => this.startPlacing({
                type: PlaceableItemType.BOOSTER,
                config: { alias: AssetsConstants.ROADBLOCK_BOOSTER_ALIAS },
                iconAlias: AssetsConstants.ROADBLOCK_BOOSTER_ALIAS
            }, globalPosition)
        );
    }

    private createButton(alias: string, position: IPointData, onClick: (globalPosition: IPointData) => void) {
        const btn = this.spriteService.createSprite(alias);

        btn.position.copyFrom(position);
        // TODO:
        //  make similar real sizes for towers and boosters (spritesheet)
        btn.scale.set(GameConstants.UI_ELEMENT_SCALE);
        btn.eventMode = "static";
        btn.cursor = "pointer";

        btn.on("pointerdown", () => {
            btn.once("pointerup", (event) => {
                event.stopPropagation();
                this.soundService.play(AssetsConstants.SOUND_CLICK);
                onClick(event.global);
            });
        });

        this.gameContainer.addChild(btn);
    }

    private startPlacing(item: TPlaceableItem, globalPosition: IPointData) {
        const localPosition = this.gameContainer.toLocal(globalPosition);

        this.selectedItem = item;
        this.ghostSprite = this.spriteService.createSprite(item.iconAlias);
        this.ghostSprite.alpha = this.ghostConfig.alpha;
        this.ghostSprite.scale.set(this.ghostConfig.scale);
        this.ghostSprite.zIndex = this.ghostConfig.zIndex;
        this.ghostSprite.position.copyFrom(localPosition);

        this.gameContainer.addChild(this.ghostSprite);
        this.enableListeners();
    }

    // TODO:
    //  розбити на менші функції
    private onGhostMove(event: FederatedPointerEvent) {
        if (!this.ghostSprite || !this.selectedItem) {
            return;
        }

        const localPosition = this.gameContainer.toLocal(event.global);
        let targetPos: IPointData = localPosition;
        this.targetNodeId = null;

        if (this.selectedItem.type === PlaceableItemType.BOOSTER) {
            const snappedNode = this.snappingService.getClosestAvailableNode(localPosition, this.entityManager.getOccupiedNodes());
            if (snappedNode) {
                targetPos = snappedNode.position;
                this.targetNodeId = snappedNode.id;
                this.isValidPlacement = true;
            } else {
                this.isValidPlacement = false;
            }
        } else if (this.selectedItem.type === PlaceableItemType.TOWER) {
            this.isValidPlacement = this.checkWithinBounds(localPosition);
        }

        this.ghostSprite.position.copyFrom(targetPos);
        this.ghostSprite.tint = this.isValidPlacement ? this.VALID_TINT : this.INVALID_TINT;
    }

    private onPlace() {
        if (!this.selectedItem || !this.ghostSprite) {
            return;
        }

        if (this.isValidPlacement) {
            if (this.selectedItem.type === PlaceableItemType.BOOSTER && this.targetNodeId) {
                this.entityManager.addRoadblock(this.targetNodeId);
            } else if (this.selectedItem.type === PlaceableItemType.TOWER) {
                const position = this.ghostSprite.position;
                this.entityManager.addTower(this.selectedItem.config as TTowerConfig, position);
            }
            this.cancelPlacing();
        } else {
            this.soundService.play(AssetsConstants.SOUND_FAIL_BUILD);
        }
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

    private cancelPlacing() {
        this.removeGhost();
        this.disableListeners();
        this.selectedItem = null;
        this.isValidPlacement = false;
        this.targetNodeId = null;
    }

    private removeGhost() {
        this.ghostSprite?.destroy();
        this.ghostSprite = null;
    }

    private checkWithinBounds(position: IPointData) {
        const distanceX = position.x - GameConstants.ISLAND_CENTER.x;
        const distanceY = position.y - GameConstants.ISLAND_CENTER.y;
        return (distanceX * distanceX + distanceY * distanceY) <= GameConstants.ISLAND_RADIUS_SQUARED;
    }
}