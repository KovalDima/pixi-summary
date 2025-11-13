import { Container, type IRenderer, type IDestroyOptions } from "pixi.js";

export type TResponsiveMode = "cover" | "contain";

export type TResponsiveOptions = {
    logicalWidth: number;
    logicalHeight: number;
    mode: TResponsiveMode;
}

export class ResponsiveContainer extends Container {
    private renderer: IRenderer;
    private readonly logicalWidth: number;
    private readonly logicalHeight: number;
    private readonly mode: TResponsiveMode;

    constructor(renderer: IRenderer, options?: TResponsiveOptions) {
        super();

        this.renderer = renderer;
        this.logicalWidth = options?.logicalWidth ?? 1;
        this.logicalHeight = options?.logicalHeight ?? 1;
        this.mode = options?.mode ?? "contain";

        this.resize();
        this.renderer.on("resize", this.resize, this);
    }

    private resize() {
        const screenWidth = this.renderer.screen.width;
        const screenHeight = this.renderer.screen.height;

        const screenRatio = screenWidth / screenHeight;
        const logicalRatio = this.logicalWidth / this.logicalHeight;

        let scale = 1.0;

        if (this.mode === "cover") {
            scale = screenRatio > logicalRatio ? screenWidth / this.logicalWidth : screenHeight / this.logicalHeight;
        } else if (this.mode === "contain") {
            scale = screenRatio > logicalRatio ? screenHeight / this.logicalHeight : screenWidth / this.logicalWidth;
        }

        this.scale.set(scale);
        this.x = (screenWidth - (this.logicalWidth * scale)) / 2;
        this.y = (screenHeight - (this.logicalHeight * scale)) / 2;
    }

    public override destroy(options?: IDestroyOptions) {
        this.renderer.off("resize", this.resize, this);
        super.destroy(options);
    }
}