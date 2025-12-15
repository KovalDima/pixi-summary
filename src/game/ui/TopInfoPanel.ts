import { Container, type Sprite } from "pixi.js";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { type SpriteService } from "../../services/SpriteService";
import { type BitmapTextService } from "../../services/BitmapTextService";
import { Config } from "../../Config";

export class TopInfoPanel extends Container {
    private readonly background: Sprite;
    private readonly labelFontSize = 25;
    private readonly labelPositionY = 30;
    private readonly labelTint = 50;
    private readonly valueFontSize = 80;
    private readonly valuePositionY = Config.colors.White;
    private readonly valueTint = Config.colors.Brown;

    private infoItems = [
        {
            label: "Points",
            value: "100M500K",
            positionX: -320,
        },
        {
            label: "Wave",
            value: "7",
            positionX: -110,
        },
        {
            label: "Next wave",
            value: "1:43",
            positionX: 110,
        },
        {
            label: "Killed",
            value: "3/14",
            positionX: 320,
        }
    ]
    // private scoreText: BitmapText;
    // private waveText: BitmapText;

    constructor(spriteService: SpriteService, bitmapTextService: BitmapTextService) {
        super();
        this.background = spriteService.createSprite(AssetsConstants.UI_INFO_BAR_ALIAS);
        this.background.anchor.set(0.5, 0);
        this.addChild(this.background);

        this.createTextForItems(bitmapTextService);
    }

    public get width() {
        return this.background.width;
    }

    public get height() {
        return this.background.height;
    }

    private createTextForItems(bitmapTextService: BitmapTextService) {
        this.infoItems.forEach((item) => {
            const label = bitmapTextService.createText(item.label, {
                fontSize: this.labelFontSize,
                tint: this.labelTint
            });
            const value = bitmapTextService.createText(item.value, {
                fontSize: this.valueFontSize,
                tint: this.valueTint
            });

            label.position.set(item.positionX, this.labelPositionY);
            value.position.set(item.positionX, this.valuePositionY);

            this.addChild(label);
            this.addChild(value);
        })

    }
}