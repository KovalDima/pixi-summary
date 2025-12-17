import { Container, Sprite, type IRenderer } from "pixi.js";
import { SpriteService } from "../services/SpriteService";
import { AssetsConstants } from "../constants/AssetsConstants";

export class StartScreen extends Container {
    private readonly background: Sprite;
    private readonly startBtn: Sprite;
    private readonly renderer: IRenderer;

    constructor(spriteService: SpriteService, renderer: IRenderer, onStart: () => void) {
        super();
        this.renderer = renderer;

        this.background = spriteService.createSprite(AssetsConstants.START_SCREEN_ALIAS);
        this.background.anchor.set(0.5);
        this.addChild(this.background);

        this.startBtn = spriteService.createSprite(AssetsConstants.START_BTN_ALIAS);
        this.startBtn.scale.set(0.55);
        this.startBtn.anchor.set(0.5);
        this.startBtn.eventMode = "static";
        this.startBtn.cursor = "pointer";
        this.addChild(this.startBtn);

        this.startBtn.on("pointerup", () => {
            onStart();
        });

        this.resize();
        this.renderer.on("resize", this.resize, this);
    }

    public resize() {
        const screenWidth = this.renderer.screen.width;
        const screenHeight = this.renderer.screen.height;

        this.background.position.set(screenWidth / 2, screenHeight / 2);

        const scaleX = screenWidth / this.background.texture.width;
        const scaleY = screenHeight / this.background.texture.height;
        const scale = Math.max(scaleX, scaleY);
        this.background.scale.set(scale);

        this.startBtn.position.set(screenWidth / 2, screenHeight - (screenHeight * 0.13));
    }

    public destroy() {
        this.renderer.off("resize", this.resize, this);
        super.destroy({ children: true });
    }
}