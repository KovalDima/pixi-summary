import { Container, Sprite } from "pixi.js";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";
import { BitmapTextService } from "../../services/BitmapTextService";
import { Config } from "../../Config";
import gsap from "gsap";

export class NextWaveButton extends Container {
    private readonly background: Sprite;
    private readonly bitmapTextService: BitmapTextService;

    constructor(spriteService: SpriteService, bitmapTextService: BitmapTextService, onClick: () => void) {
        super();
        this.bitmapTextService = bitmapTextService;

        this.background = spriteService.createSprite(AssetsConstants.UI_BTN_NEXT_WAVE_ALIAS);
        this.background.anchor.set(0.5);
        this.addChild(this.background);

        this.eventMode = "static";
        this.cursor = "pointer";

        this.on("pointerdown", () => {
            this.background.scale.set(0.97);
        });

        this.on("pointerup", () => {
            this.background.scale.set(1.0);
            onClick();
        });

        this.on("pointerupoutside", () => {
            this.background.scale.set(1.0);
        });
    }

    public setEnabled(enabled: boolean) {
        this.background.alpha = enabled ? 1.0 : 0.5;
        this.cursor = enabled ? "pointer" : "default";
        this.eventMode = enabled ? "static" : "none";
    }

    public showBonusLabel() {
        const label = this.bitmapTextService.createText("Bonus coins", {
            fontSize: 26,
            tint: Config.colors.Yellow
        });

        label.anchor.set(0.5);
        label.position.set(0, -this.height / 2 - 20);
        this.addChild(label);

        gsap.to(label, {
            y: label.y - 50,
            alpha: 0,
            duration: 1.5,
            ease: "power1.out",
            onComplete: () => {
                label.destroy();
            }
        });
    }

    public get height() {
        return this.background.height;
    }
}