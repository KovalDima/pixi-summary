import { Container, Graphics, type FederatedPointerEvent } from "pixi.js";
import { Config } from "../../Config";
import type { BitmapTextService } from "../../services/BitmapTextService";

export class GameOverPopup extends Container {
    private readonly bitmapTextService: BitmapTextService;
    private readonly screenWidth: number;
    private readonly screenHeight: number;

    constructor(
        screenWidth: number,
        screenHeight: number,
        bitmapTextService: BitmapTextService,
        stats: { score: number, killed: number },
        onRestart: () => void
    ) {
        super();
        this.bitmapTextService = bitmapTextService;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.createBackground();
        this.createTitle();
        this.createStats(stats);
        this.createRestartButton(onRestart);
    }

    private createBackground() {
        const background = new Graphics();
        const alpha = 0.85;

        background.beginFill(Config.colors.Black, alpha);
        background.drawRect(0, 0, this.screenWidth, this.screenHeight);
        background.endFill();

        this.addChild(background);
    }

    private createTitle() {
        const titleText = this.bitmapTextService.createText("GAME OVER", {
            fontSize: 90,
            tint: Config.colors.Red
        });

        titleText.anchor.set(0.5);
        titleText.position.set(this.screenWidth / 2, this.screenHeight / 2 - 120);

        this.addChild(titleText);
    }

    private createStats(stats: { score: number, killed: number }) {
        const centerX = this.screenWidth / 2;
        const centerY = this.screenHeight / 2;
        const gap = 50;
        const offsetY = 30;
        const scoreText = this.bitmapTextService.createText(`Total Score ${stats.score}`, {
            fontSize: 45,
            tint: Config.colors.White
        });
        const killedText = this.bitmapTextService.createText(`Enemies Killed ${stats.killed}`, {
            fontSize: 45,
            tint: Config.colors.White
        });

        scoreText.anchor.set(0.5);
        scoreText.position.set(centerX, centerY - offsetY);
        this.addChild(scoreText);

        killedText.anchor.set(0.5);
        killedText.position.set(centerX, centerY - offsetY + gap);
        this.addChild(killedText);
    }

    private createRestartButton(onRestart: () => void) {
        const container = new Container();
        const text = this.bitmapTextService.createText("Restart Game", {
            fontSize: 50,
            tint: Config.colors.Red
        });
        const underline = new Graphics();

        text.anchor.set(0.5);

        underline.lineStyle(4, Config.colors.Red);
        underline.moveTo(-text.width / 2, text.height / 2);
        underline.lineTo(text.width / 2, text.height / 2);

        container.addChild(text);
        container.addChild(underline);
        container.position.set(this.screenWidth / 2, this.screenHeight / 2 + 150);
        container.eventMode = "static";
        container.cursor = "pointer";

        container.on("pointerup", (e: FederatedPointerEvent) => {
            e.stopPropagation();
            onRestart();
        });

        this.addChild(container);
    }
}