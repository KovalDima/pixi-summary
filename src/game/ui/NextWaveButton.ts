import { Container, Sprite } from "pixi.js";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";

export class NextWaveButton extends Container {
    private readonly bg: Sprite;

    constructor(spriteService: SpriteService, onClick: () => void) {
        super();

        this.bg = spriteService.createSprite(AssetsConstants.UI_BTN_NEXT_WAVE_ALIAS);
        this.bg.anchor.set(0.5);
        this.addChild(this.bg);

        this.eventMode = "static";
        this.cursor = "pointer";

        this.on("pointerdown", () => {
            // Можна додати tween анімацію натискання
            this.bg.scale.set(0.95);
        });

        this.on("pointerup", () => {
            this.bg.scale.set(1.0);
            onClick();
        });

        this.on("pointerupoutside", () => {
            this.bg.scale.set(1.0);
        });
    }

    public get height() {
        return this.bg.height;
    }
}