import { Container, Graphics } from "pixi.js";
import { Config } from "../../Config";
import type { BitmapTextService } from "../../services/BitmapTextService";

export class GameOverPopup extends Container {
    private bitmapTextService: BitmapTextService;

    constructor(screenWidth: number, screenHeight: number, bitmapTextService: BitmapTextService) {
        super();
        this.bitmapTextService = bitmapTextService;

        const background = new Graphics();
        const alpha = 0.7;

        background.beginFill(Config.colors.Black, alpha);
        background.drawRect(0, 0, screenWidth, screenHeight);
        background.endFill();
        this.addChild(background);

        const text = bitmapTextService.createText("GAME OVER", {fontSize: 100, tint: Config.colors.Red});

        text.anchor.set(0.5);
        text.position.set(screenWidth / 2, screenHeight / 2);
        this.addChild(text);

        // TODO: restart button here
    }
}