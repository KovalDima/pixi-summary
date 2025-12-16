import { Container, Sprite } from "pixi.js";
import { SpriteService } from "../../services/SpriteService";
import { AssetsConstants } from "../../constants/AssetsConstants";
import gsap from "gsap";

export class Coin extends Container {
    private readonly sprite: Sprite;

    constructor(spriteService: SpriteService) {
        super();
        this.sprite = spriteService.createSprite(AssetsConstants.COIN_ALIAS);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.5);
        this.addChild(this.sprite);

        gsap.to(this.sprite.scale, {
            x: -0.5,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
}