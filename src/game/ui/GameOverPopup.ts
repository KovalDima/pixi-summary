import { Container, Graphics, type FederatedPointerEvent } from "pixi.js";
import { Config } from "../../Config";
import type { BitmapTextService } from "../../services/BitmapTextService";
import type { AnimatedSpriteService } from "../../services/AnimatedSpriteService";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { AnimationConstants } from "../../constants/AnimationConstants";

export class GameOverPopup extends Container {
    private readonly bitmapTextService: BitmapTextService;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly screenWidth: number;
    private readonly screenHeight: number;

    constructor(
        screenWidth: number,
        screenHeight: number,
        bitmapTextService: BitmapTextService,
        animatedSpriteService: AnimatedSpriteService,
        stats: { score: number, killed: number },
        onRestart: () => void
    ) {
        super();
        this.bitmapTextService = bitmapTextService;
        this.animatedSpriteService = animatedSpriteService;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.createBackground();
        this.createFireAnimation();
        this.createTitle();
        this.createStats(stats);
        this.createRestartButton(onRestart);
    }

    private createBackground() {
        const background = new Graphics();
        const alpha = 0.9;

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
        const gap = 60;
        const offsetY = 30;
        const scoreText = this.bitmapTextService.createText(`Total Score  ${stats.score}`, {
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

    private createFireAnimation() {
        const fire = this.animatedSpriteService.createAnimation(
            AssetsConstants.FLAME_ANIM_ALIAS,
            AnimationConstants.FLAME
        );

        fire.width = this.screenWidth;
        fire.height = 300;
        fire.anchor.set(0.5, 1);
        fire.position.set(this.screenWidth / 2, this.screenHeight);
        fire.animationSpeed = 0.3;

        this.addChild(fire);
    }
}