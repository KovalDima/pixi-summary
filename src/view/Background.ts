import { Sprite, Texture, type IRenderer } from "pixi.js";

export class Background extends Sprite {
    private renderer: IRenderer;

    constructor(texture: Texture, renderer: IRenderer) {
        super(texture);

        this.renderer = renderer;

        this.anchor.set(0.5);
        this.resize();

        this.renderer.on("resize", this.resize, this);
    }

    private resize() {
        const screenWidth = this.renderer.screen.width;
        const screenHeight = this.renderer.screen.height;

        const screenRatio = screenWidth / screenHeight;
        const textureRatio = this.texture.width / this.texture.height;

        if (screenRatio > textureRatio) {
            this.width = screenWidth;
            this.height = screenWidth / textureRatio;
        } else {
            this.height = screenHeight;
            this.width = screenHeight * textureRatio;
        }

        this.x = screenWidth / 2;
        this.y = screenHeight / 2;
    }
}