import { Container, type IPointData, Sprite } from "pixi.js";
import { type TTowerConfig, TowerType } from "./TowerTypes";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { DepthCalculator } from "../../utils/DepthCalculator";
import { type SpriteService } from "../../services/SpriteService";
import { type AnimatedSpriteService } from "../../services/AnimatedSpriteService";
import { type SoundService } from "../../services/SoundService";
import { HighlightService } from "../../services/HighlightService";
import { Config } from "../../Config";
import { MapConfig } from "../../configs/MapConfig";
import { Tower } from "./Tower";
import { type ProjectileManager } from "../projectiles/ProjectileManager";
import { type Enemy } from "../entities/Enemy";

export class TowerManager {
    private readonly gameContainer: Container;
    private readonly spriteService: SpriteService;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly soundService: SoundService;
    private readonly highlightService: HighlightService;
    private readonly projectileManager: ProjectileManager;

    private towers: Tower[] = [];
    private occupiedSlots: Set<string> = new Set();

    constructor(
        gameContainer: Container,
        spriteService: SpriteService,
        animatedSpriteService: AnimatedSpriteService,
        soundService: SoundService,
        highlightService: HighlightService,
        projectileManager: ProjectileManager,
    ) {
        this.gameContainer = gameContainer;
        this.spriteService = spriteService;
        this.animatedSpriteService = animatedSpriteService;
        this.soundService = soundService;
        this.highlightService = highlightService;
        this.projectileManager = projectileManager;
    }

    public isSlotOccupied(slotId: string) {
        return this.occupiedSlots.has(slotId);
    }

    public createTower(config: TTowerConfig, position: IPointData, slotId: string) {
        if (this.occupiedSlots.has(slotId)) {
            return;
        }

        const towerView = this.getTowerView(config);

        towerView.anchor.set(0.5, 0.75);

        const towerObject = new Tower(config, towerView, this.projectileManager);
        const towerScale = DepthCalculator.getTowerScale(position.y);
        const towerZIndex = position.y;

        towerObject.position.set(position.x, position.y);
        towerObject.scale.set(towerScale);
        towerObject.zIndex = towerZIndex;

        this.towers.push(towerObject);
        this.occupiedSlots.add(slotId);

        this.gameContainer.addChild(towerObject);
        this.gameContainer.sortChildren();
    }

    public highlightAvailableSlots() {
        const freeSlots = MapConfig.getTowerSlots()
            .filter((slot) => !this.occupiedSlots.has(slot.id))
            .map((slot) => slot.position);

        this.highlightService.show(freeSlots, {
            color: Config.colors.White,
            alpha: 0.3,
            radius: 25,
            lineWidth: 2,
            lineColor: Config.colors.White
        });
    }

    public hideHighlights() {
        this.highlightService.clear();
    }

    public update(delta: number, enemies: Enemy[]) {
        this.towers.forEach((tower) => {
            tower.update(delta, enemies);
        });
    }

    private getTowerView(config: TTowerConfig) {
        let tower;
        switch (config.type) {
            case TowerType.REGULAR_TOWER:
                tower = this.spriteService.createSprite(config.assetAlias);
                this.soundService.play(AssetsConstants.SOUND_REGULAR_TOWER_BUILD);
                break;

            case TowerType.ARCHER_TOWER:
                if (!config.animationName) {
                    throw new Error(`Missing animationName for tower config: ${config.type}`)
                }
                tower = this.animatedSpriteService.createAnimation(config.assetAlias, config.animationName);
                tower.loop = false;
                tower.animationSpeed = 0.03;
                this.soundService.stop(AssetsConstants.SOUND_BUILD_PROCESS);
                this.soundService.play(AssetsConstants.SOUND_BUILD_PROCESS);
                break;
            default:
                throw new Error("Unknown tower type");
        }
        return tower;
    }
}