import { type Container, type FederatedPointerEvent, type IPointData, Sprite } from "pixi.js";
import { type SpriteService } from "../services/SpriteService";
import { type EntityManager } from "./EntityManager";
import { AssetsConstants } from "../constants/AssetsConstants";
// import { GameConstants } from "../constants/GameConstants";

export class TowerPlacementController {
    private readonly gameContainer: Container;
    private readonly entityManager: EntityManager;
    private readonly spriteService: SpriteService;

    private towerButton: Sprite | null = null;
    private ghostTower: Sprite | null = null;
    // private currentTargetPlatformPos: IPointData | null = null;

    constructor(gameContainer: Container, entityManager: EntityManager, spriteService: SpriteService) {
        this.gameContainer = gameContainer;
        this.entityManager = entityManager;
        this.spriteService = spriteService;
    }

    public init() {
        this.addTowerButton();

        this.gameContainer.on("pointermove", this.onGhostMove, this);
        this.gameContainer.on("pointerdown", this.onPlaceTower, this);
    }

    private addTowerButton() {
        this.towerButton = this.spriteService.createSprite(AssetsConstants.TOWER_1_ALIAS);
        this.towerButton.position.set(50, 960);
        this.towerButton.scale.set(0.12);

        this.towerButton.eventMode = "static";
        this.towerButton.cursor = "pointer";

        this.towerButton.on("pointerdown", (e: FederatedPointerEvent) => {
            e.stopPropagation();
            this.startPlacingTower();
        });

        this.gameContainer.addChild(this.towerButton);
    }

    private startPlacingTower() {
        this.ghostTower = this.spriteService.createSprite(AssetsConstants.TOWER_1_ALIAS);
        this.ghostTower.position.set(this.towerButton?.x, this.towerButton?.y);
        this.ghostTower.alpha = 0.5;
        this.ghostTower.scale.set(0.14);

        this.gameContainer.addChild(this.ghostTower);
    }

    private onGhostMove(e: FederatedPointerEvent) {
        if (!this.ghostTower) {
            return;
        }

        const localPos = this.gameContainer.toLocal(e.global);
        this.ghostTower.position.copyFrom(localPos);

        //const closestPlatformPos = this.getClosestEmptyPlatformPos(localPos);

        // if (closestPlatformPos) {
        //     this.ghostTower.position.copyFrom(closestPlatformPos);
        //     this.ghostTower.alpha = 1.0;
        //     this.currentTargetPlatformPos = closestPlatformPos;
        // } else {
        //     this.ghostTower.alpha = 0.5;
        //     this.currentTargetPlatformPos = null;
        // }
    }

    private onPlaceTower() {
        // if (this.currentTargetPlatformPos) {
        //     this.entityManager.addTower(this.currentTargetPlatformPos); // add at place of click
        // }
        this.stopPlacing();
    }

    // TODO:
    // method for correct towers placement
    // private getClosestEmptyPlatformPos(position: IPointData) {
    //     let closestDist = Infinity;
    //     let targetPlatformPos: IPointData | null = null;
    //
    //     for (const platform of GameConstants.TOWER_PLATFORM_POSITIONS) {
    //         if (this.entityManager.checkIsPlatformOccupied(platform)) {
    //             continue;
    //         }
    //
    //         const distanceX = position.x - platform.x;
    //         const distanceY = position.y - platform.y;
    //         const distance = Math.hypot(distanceX, distanceY);
    //
    //         if (distance < closestDist && distance < GameConstants.TOWER_SNAP_DISTANCE) {
    //             closestDist = distance;
    //             targetPlatformPos = platform;
    //         }
    //     }
    //
    //     return targetPlatformPos;
    // }

    private stopPlacing() {
        // this.currentTargetPlatformPos = null;
        this.ghostTower?.destroy();
        this.ghostTower = null;
    }
}