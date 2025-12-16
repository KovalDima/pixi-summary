import { Container, Sprite } from "pixi.js";
import { SpriteService } from "../../services/SpriteService";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { type IPoolable } from "../../core/pool/IPoolable";
import gsap from "gsap";

export class Coin extends Container implements IPoolable{
    private readonly sprite: Sprite;

    constructor(spriteService: SpriteService) {
        super();
        this.sprite = spriteService.createSprite(AssetsConstants.COIN_ALIAS);
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);
    }

    public reset(position: {x: number, y: number}) {
        this.position.copyFrom(position);
        this.scale.set(1);
        this.alpha = 1;
        this.sprite.scale.set(0.5);

        gsap.to(this.sprite.scale, {
            x: -0.5,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    public clean() {
        gsap.killTweensOf(this);
        gsap.killTweensOf(this.sprite);
        gsap.killTweensOf(this.sprite.scale);
        this.removeFromParent();
    }
}