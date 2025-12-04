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

    // private towerButtons: Map<string, Sprite> = new Map();
    // private ghostTower: Sprite | null = null;
    // private isValidPlacement: boolean = false;
    //
    // private selectedTowerConfig: TTowerConfig | null = null;
    // private readonly ghostTowerConfig = {
    //     scale: 0.14,
    //     alpha: 0.5,
    //     zIndex: 10000,
    // };

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
                () => this.startPlacing({
                    type: PlaceableItemType.TOWER,
                    config,
                    iconAlias: config.iconAlias
                })
            );
        });
    }

    private createBoosterButtons() {
        this.createButton(
            AssetsConstants.ROADBLOCK_BOOSTER_ALIAS,
            GameConstants.ROADBLOCK_BOOSTER_BUTTON_POSITION,
            () => this.startPlacing({
                type: PlaceableItemType.BOOSTER,
                config: { alias: AssetsConstants.ROADBLOCK_BOOSTER_ALIAS },
                iconAlias: AssetsConstants.ROADBLOCK_BOOSTER_ALIAS
            })
        );
    }

    private createButton(alias: string, position: IPointData, onClick: () => void) {
        const btn = this.spriteService.createSprite(alias);
        btn.position.copyFrom(position);
        btn.scale.set(GameConstants.UI_ELEMENT_SCALE); // for towers and boosters may be different scale
        btn.eventMode = "static";
        btn.cursor = "pointer";

        btn.on("pointerdown", () => {
            btn.once("pointerup", () => {
                this.soundService.play(AssetsConstants.SOUND_CLICK);
                onClick();
            });
        });

        this.gameContainer.addChild(btn);
    }

    private startPlacing(item: TPlaceableItem) {
        if (this.ghostSprite) {
            this.removeGhost();
        }

        this.selectedItem = item;
        this.ghostSprite = this.spriteService.createSprite(item.iconAlias);
        this.ghostSprite.alpha = 0.5;
        this.ghostSprite.scale.set(0.14);
        this.ghostSprite.zIndex = 10000;

        this.gameContainer.addChild(this.ghostSprite);
        this.enableListeners();
    }

    private onGhostMove(event: FederatedPointerEvent) {
        if (!this.ghostSprite || !this.selectedItem) {
            return;
        }

        const localPosition = this.gameContainer.toLocal(event.global);
        const snappedNode = this.snappingService.getClosestAvailableNode(localPosition, this.entityManager.getOccupiedNodes());

        if (snappedNode) {
            this.ghostSprite.position.copyFrom(snappedNode.position);
            this.targetNodeId = snappedNode.id;
            this.isValidPlacement = true;
        } else {
            this.ghostSprite.position.copyFrom(localPosition);
            this.targetNodeId = null;

            // TODO:
            //  вежі також потім липнуть до своїх точок
            if (this.selectedItem.type === PlaceableItemType.TOWER) {
                this.isValidPlacement = this.checkWithinBounds(localPosition);
            } else {
                this.isValidPlacement = false;
            }
        }

        this.ghostSprite.tint = this.isValidPlacement ? this.VALID_TINT : this.INVALID_TINT;
    }

    private onPlace(event: FederatedPointerEvent) {
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

    private enableListeners() {
        const cancel = () => this.cancelPlacing();

        this.gameContainer.on("pointermove", this.onGhostMove, this);
        this.gameContainer.on("pointerup", this.onPlace, this);
        this.gameContainer.on("pointerdown", (e) => {
            const rightMouseBtn = 2;
            if (e.button === rightMouseBtn) {
                cancel();
            }
        });
        this.domEventHelper.on("keydown", (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                cancel();
            }
        });
    }

    private disableListeners() {
        this.gameContainer.off("pointermove", this.onGhostMove, this);
        this.gameContainer.off("pointerup", this.onPlace, this);
        // Clean up other listeners... ("keydown" and ?)
    }

    private checkWithinBounds(position: IPointData) {
        const distanceX = position.x - GameConstants.ISLAND_CENTER.x;
        const distanceY = position.y - GameConstants.ISLAND_CENTER.y;
        return (distanceX * distanceX + distanceY * distanceY) <= GameConstants.ISLAND_RADIUS_SQUARED;
    }

    // private startTowerPlacing(event: FederatedPointerEvent, button: Sprite, config: TTowerConfig) {
    //     event.stopPropagation();
    //     if (this.ghostTower) {
    //         this.removeGhost();
    //     }
    //     this.createGhostTower(config, button);
    //     this.onGhostMove(event);
    //     this.enableTowerPlacingListeners();
    // }
    //
    // private createTowerButtons() {
    //     GameConstants.TOWER_BUTTON_POSITIONS.forEach((buttonData) => {
    //         const towerConfig = TowerRegistry.getTowerData(buttonData.type);
    //
    //         if (!towerConfig) {
    //             throw new Error(`Tower config not found for type: ${buttonData.type}`);
    //         }
    //
    //         const towerButton = this.spriteService.createSprite(towerConfig.iconAlias);
    //         towerButton.position.copyFrom(buttonData.position);
    //         towerButton.scale.set(GameConstants.UI_ELEMENT_SCALE);
    //
    //         towerButton.eventMode = "static";
    //         towerButton.cursor = "pointer";
    //
    //         towerButton.on("pointerdown", () => {
    //             towerButton.once("pointerup", (event) => {
    //                 this.soundService.play(AssetsConstants.SOUND_CLICK);
    //                 this.startTowerPlacing(event, towerButton, towerConfig);
    //             });
    //         });
    //
    //         this.gameContainer.addChild(towerButton);
    //         this.towerButtons.set(towerConfig.type, towerButton);
    //     })
    // }
    //
    // private createGhostTower(config: TTowerConfig, button: Sprite) {
    //     this.selectedTowerConfig = config;
    //     this.ghostTower = this.spriteService.createSprite(config.iconAlias);
    //     this.ghostTower.position.copyFrom(button.position);
    //     this.ghostTower.alpha = this.ghostTowerConfig.alpha;
    //     this.ghostTower.scale.set(this.ghostTowerConfig.scale);
    //     this.ghostTower.zIndex = this.ghostTowerConfig.zIndex;
    //     this.ghostTower.tint = this.INVALID_TINT;
    //     this.isValidPlacement = false;
    //
    //     this.gameContainer.addChild(this.ghostTower);
    // }
    //
    // private onGhostMove(event: FederatedPointerEvent) {
    //     if (!this.ghostTower) {
    //         return;
    //     }
    //
    //     const localPosition = this.gameContainer.toLocal(event.global);
    //
    //     this.ghostTower.position.copyFrom(localPosition);
    //     this.isValidPlacement = this.checkWithinBounds(localPosition);
    //     this.ghostTower.tint = this.isValidPlacement ? this.VALID_TINT : this.INVALID_TINT;
    // }
    //
    // private onCancelTowerPlacing(event: FederatedPointerEvent) {
    //     const rightMouseBtn = 2;
    //     if (event.button === rightMouseBtn) {
    //         this.cancelTowerPlacing();
    //     }
    // }
    //
    // private onKeyDown(event: KeyboardEvent) {
    //     if (event.key === "Escape") {
    //         this.cancelTowerPlacing();
    //     }
    // }
    //
    // private onTowerPlace(event: FederatedPointerEvent) {
    //     if (!this.ghostTower || !this.selectedTowerConfig) {
    //         return;
    //     }
    //
    //     if (this.isValidPlacement) {
    //         const localPosition = this.gameContainer.toLocal(event.global);
    //         this.entityManager.addTower(this.selectedTowerConfig, localPosition);
    //         this.cancelTowerPlacing();
    //     } else {
    //         this.soundService.play(AssetsConstants.SOUND_FAIL_BUILD);
    //     }
    // }
    //
    // private cancelTowerPlacing() {
    //     this.removeGhost();
    //     this.disableTowerPlacingListeners();
    //     this.isValidPlacement = false;
    // }
    //
    // private removeGhost() {
    //     this.ghostTower?.destroy();
    //     this.ghostTower = null;
    // }
    //
    // private checkWithinBounds(position: IPointData) {
    //     const distanceX = position.x - GameConstants.ISLAND_CENTER.x;
    //     const distanceY = position.y - GameConstants.ISLAND_CENTER.y;
    //     const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    //
    //     return distanceSquared <= GameConstants.ISLAND_RADIUS_SQUARED;
    // }
    //
    // private enableTowerPlacingListeners() {
    //     this.gameContainer.on("pointermove", this.onGhostMove, this);
    //     this.gameContainer.on("pointerup", this.onTowerPlace, this);
    //     this.gameContainer.on("pointerdown", this.onCancelTowerPlacing, this);
    //     this.domEventHelper.on("keydown", this.onKeyDown, this);
    // }
    //
    // private disableTowerPlacingListeners() {
    //     this.gameContainer.off("pointermove", this.onGhostMove, this);
    //     this.gameContainer.off("pointerup", this.onTowerPlace, this);
    //     this.gameContainer.off("pointerdown", this.onCancelTowerPlacing, this);
    //     this.domEventHelper.off("keydown", this.onKeyDown, this);
    // }
}