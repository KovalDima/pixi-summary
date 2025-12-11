import { Container, Sprite } from "pixi.js";
import { SpriteService } from "../../services/SpriteService";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { GameConstants } from "../../constants/GameConstants";
import { Config } from "../../Config";
import { HealthBar } from "../ui/HealthBar";
import { EffectUtils } from "../../utils/EffectUtils";

export class MagicGate extends Container {
    private readonly sprite: Sprite;
    private readonly healthBar: HealthBar;
    private readonly maxHp: number;
    private currentHp: number;

    constructor(spriteService: SpriteService) {
        super();
        this.maxHp = GameConstants.PLAYER_MAX_HP;
        this.currentHp = this.maxHp;
        this.sprite = spriteService.createSprite(AssetsConstants.MAGIC_GATE_ALIAS);
        this.sprite.scale.set(0.45);
        this.sprite.anchor.set(0.5, 0.6);
        this.addChild(this.sprite);
        this.healthBar = new HealthBar(this.maxHp);
        this.healthBar.position.set(-29, -80);
        this.addChild(this.healthBar);
    }

    public takeDamage(amount: number) {
        this.currentHp -= amount;

        if (this.currentHp < 0) {
            this.currentHp = 0;
        }

        this.healthBar.update(this.currentHp);
        EffectUtils.blinkRed(this.sprite);
    }

    public checkDestroyed() {
        return this.currentHp <= 0;
    }
}