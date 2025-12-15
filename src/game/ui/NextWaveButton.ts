import { Container, Sprite } from "pixi.js";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";

export class NextWaveButton extends Container {
    private readonly background: Sprite;

    constructor(spriteService: SpriteService, onClick: () => void) {
        super();

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

    public get height() {
        return this.background.height;
    }
}