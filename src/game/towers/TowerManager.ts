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

export class TowerManager {
    private readonly gameContainer: Container;
    private readonly spriteService: SpriteService;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly soundService: SoundService;
    private readonly highlightService: HighlightService;

    // TODO: do I need this towers?
    private towers: Sprite[] = [];
    private occupiedSlots: Set<string> = new Set();

    constructor(
        gameContainer: Container,
        spriteService: SpriteService,
        animatedSpriteService: AnimatedSpriteService,
        soundService: SoundService,
        highlightService: HighlightService
    ) {
        this.gameContainer = gameContainer;
        this.spriteService = spriteService;
        this.animatedSpriteService = animatedSpriteService;
        this.soundService = soundService;
        this.highlightService = highlightService;
    }

    public isSlotOccupied(slotId: string) {
        return this.occupiedSlots.has(slotId);
    }

    public createTower(config: TTowerConfig, position: IPointData, slotId: string) {
        if (this.occupiedSlots.has(slotId)) {
            return;
        }

        const towerObject = this.getTower(config);
        const towerScale = DepthCalculator.getTowerScale(position.y);
        const towerZIndex = position.y;

        towerObject.position.set(position.x, position.y);
        towerObject.scale.set(towerScale);
        towerObject.anchor.set(0.5, 0.75);
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

    private getTower(config: TTowerConfig) {
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
                this.soundService.play(AssetsConstants.SOUND_BUILD_PROCESS);
                break;
            default:
                throw new Error("Unknown tower type");
        }
        return tower;
    }
}