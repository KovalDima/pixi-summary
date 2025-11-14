import { type Container, type IPointData, Sprite } from "pixi.js";
import { AnimatedSpriteService} from "../services/AnimatedSpriteService";
import { AssetsConstants} from "../constants/AssetsConstants";
import { AnimationConstants } from "../constants/AnimationConstants";
import { type SpriteService } from "../services/SpriteService";

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

    public addTower(position: IPointData) {
        const towerSprite = this.spriteService.createSprite(AssetsConstants.TOWER_1_ALIAS);

        towerSprite.position.set(position.x, position.y);
        towerSprite.scale.set(0.16);

        this.towers.push(towerSprite);
        this.gameContainer.addChild(towerSprite);
    }

    public checkIsPlatformOccupied(position: IPointData) {
        return this.towers.some((tower) => tower.position.x === position.x && tower.position.y === position.y);
    }

    // TODO:
    // public createEnemy() {}
    // public update(delta: number) {}
}