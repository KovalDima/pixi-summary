import { Container, type Sprite, type BitmapText } from "pixi.js";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { type SpriteService } from "../../services/SpriteService";
import { type BitmapTextService } from "../../services/BitmapTextService";
import { Config } from "../../Config";

export class TopInfoPanel extends Container {
    private readonly background: Sprite;
    private readonly labelFontSize = 30;
    private readonly labelPositionY = 24;
    private readonly labelTint = Config.colors.White;
    private readonly valueFontSize = 50;
    private readonly valuePositionY = 55;
    private readonly valueTint = Config.colors.Brown;

    private balanceText: BitmapText | null = null;
    private waveText: BitmapText | null = null;
    private nextWaveText: BitmapText | null = null;
    private killedText: BitmapText | null = null;

    constructor(spriteService: SpriteService, bitmapTextService: BitmapTextService) {
        super();
        this.background = spriteService.createSprite(AssetsConstants.UI_INFO_BAR_ALIAS);
        this.background.anchor.set(0.5, 0);
        this.addChild(this.background);

        this.initTexts(bitmapTextService);
    }

    public get width() {
        return this.background.width;
    }

    public get height() {
        return this.background.height;
    }

    public updateWave(wave: number) {
        if (this.waveText) {
            this.waveText.text = `${wave}`;
        }
    }

    public updateNextWaveTimer(seconds: number) {
        if (this.nextWaveText) {
            if (seconds <= 0) {
                this.nextWaveText.text = "0";
            } else {
                this.nextWaveText.text = `${Math.floor(seconds)}s`;
            }
        }
    }

    private initTexts(bitmapTextService: BitmapTextService) {
        this.createGroup(bitmapTextService, "POINTS", -345, (text) => this.balanceText = text);
        this.createGroup(bitmapTextService, "WAVE", -110, (text) => this.waveText = text);
        this.createGroup(bitmapTextService, "NEXT WAVE", 110, (text) => this.nextWaveText = text);
        this.createGroup(bitmapTextService, "KILLED", 345, (text) => this.killedText = text);
    }

    private createGroup(
        bitmapTextService: BitmapTextService,
        labelStr: string,
        x: number,
        storeRef: (text: BitmapText) => void
    ) {
        const label = bitmapTextService.createText(labelStr, {
            fontSize: this.labelFontSize,
            tint: this.labelTint
        });
        const value = bitmapTextService.createText("0", {
            fontSize: this.valueFontSize,
            tint: this.valueTint
        });

        label.anchor.set(0.5, 0);
        label.position.set(x, this.labelPositionY);
        this.addChild(label);
        value.anchor.set(0.5, 0);
        value.position.set(x, this.valuePositionY);
        this.addChild(value);

        storeRef(value);
    }
}