import { type Container, type IPointData, Sprite } from "pixi.js";
import { AnimatedSpriteService } from "../services/AnimatedSpriteService";
import { AssetsConstants } from "../constants/AssetsConstants";
import { AnimationConstants } from "../constants/AnimationConstants";
import { type SpriteService } from "../services/SpriteService";
import { DepthCalculator } from "../utils/DepthCalculator";
import { type TTowerConfig, TowerType } from "./towers/TowerTypes";
import { type SoundService } from "../services/SoundService";

export type TFlameConfig = {
    position: IPointData,
    scale: number,
    width: number,
    animationSpeed: number
}

export class EntityManager {
    private readonly gameContainer: Container;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;

    private towers: Sprite[] = [];

    constructor(
        gameContainer: Container,
        animatedSpriteService: AnimatedSpriteService,
        spriteService: SpriteService,
        soundService: SoundService
    ) {
        this.gameContainer = gameContainer;
        this.animatedSpriteService = animatedSpriteService;
        this.spriteService = spriteService;
        this.soundService = soundService;
    }

    public addFlame(config: TFlameConfig) {
        const flameAnim = this.animatedSpriteService.createAnimation(
            AssetsConstants.FLAME_ANIM_ALIAS, AnimationConstants.FLAME
        );

        flameAnim.position.set(config.position.x, config.position.y);
        flameAnim.scale.set(config.scale);
        flameAnim.width = config.width;
        flameAnim.animationSpeed = config.animationSpeed;

        this.gameContainer.addChild(flameAnim);
    }

    public addTower(config: TTowerConfig, position: IPointData) {
        const towerObject = this.getTower(config);
        const towerScale = DepthCalculator.getTowerScale(position.y);
        const towerZIndex = position.y;

        towerObject.position.set(position.x, position.y);
        towerObject.scale.set(towerScale);
        towerObject.zIndex = towerZIndex;

        this.towers.push(towerObject);
        this.gameContainer.addChild(towerObject);
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
        }
        return tower;
    }

    // TODO:
    // public createEnemy() {}
    // public update(delta: number) {}
}