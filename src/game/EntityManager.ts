import { type Container, type IPointData, Sprite } from "pixi.js";
import { AnimatedSpriteService } from "../services/AnimatedSpriteService";
import { AssetsConstants } from "../constants/AssetsConstants";
import { AnimationConstants } from "../constants/AnimationConstants";
import { type SpriteService } from "../services/SpriteService";
import { DepthCalculator } from "../utils/DepthCalculator";
import { type TTowerConfig, TowerType } from "./towers/TowerTypes";

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

    private towers: Sprite[] = [];

    constructor(gameContainer: Container, animatedSpriteService: AnimatedSpriteService, spriteService: SpriteService) {
        this.gameContainer = gameContainer;
        this.animatedSpriteService = animatedSpriteService;
        this.spriteService = spriteService;
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
        let towerObject;
        const towerScale = DepthCalculator.getTowerScale(position.y);
        const towerZIndex = position.y;

        switch (config.type) {
            case TowerType.REGULAR_TOWER:
                towerObject = this.spriteService.createSprite(config.assetAlias);
                break;

            case TowerType.ARCHER_TOWER:
                if (!config.animationName) {
                    throw new Error(`Missing animationName for tower config: ${config.type}`)
                }
                towerObject = this.animatedSpriteService.createAnimation(config.assetAlias, config.animationName);
                towerObject.loop = false;
                towerObject.animationSpeed = 0.03;
                break;
        }


        towerObject.position.set(position.x, position.y);
        towerObject.scale.set(towerScale);
        towerObject.zIndex = towerZIndex;

        this.towers.push(towerObject);
        this.gameContainer.addChild(towerObject);
    }

    // TODO:
    // public createEnemy() {}
    // public update(delta: number) {}
}