import type { Container, IPointData } from "pixi.js";
import { AnimatedSpriteService} from "../services/AnimatedSpriteService";
import { AssetsConstants} from "../constants/AssetsConstants";
import { AnimationConstants } from "../constants/AnimationConstants";

export type TFlameConfig = {
    position: IPointData,
    scale: number,
    width: number,
    animationSpeed: number
}

export class EntityManager {
    private readonly gameContainer: Container;
    private readonly animatedSpriteService: AnimatedSpriteService;

    constructor(gameContainer: Container, animatedSpriteService: AnimatedSpriteService) {
        this.gameContainer = gameContainer;
        this.animatedSpriteService = animatedSpriteService;
    }

    public createFlame(config: TFlameConfig) {
        const flameAnim = this.animatedSpriteService.createAnimation(
            AssetsConstants.FLAME_ANIM_ALIAS, AnimationConstants.FLAME
        );

        flameAnim.position.set(config.position.x, config.position.y);
        flameAnim.scale.set(config.scale);
        flameAnim.width = config.width;
        flameAnim.animationSpeed = config.animationSpeed;

        this.gameContainer.addChild(flameAnim);
    }

    // next logic
    // public createEnemy() {}
    // public createTower() {}
    // public update(delta: number) {}
}