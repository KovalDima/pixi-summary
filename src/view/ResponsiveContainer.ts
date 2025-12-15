import { Container, type IRenderer, type IDestroyOptions } from "pixi.js";

export enum ResponsiveMode {
    cover = "cover",
    contain = "contain"
}

export type TPaddings = {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number,
}

export type TResponsiveOptions = {
    logicalWidth: number,
    logicalHeight: number,
    mode: ResponsiveMode,
    paddings?: TPaddings,
    scaleMultiplier?: number,
}

export class ResponsiveContainer extends Container {
    private renderer: IRenderer;
    private readonly logicalWidth: number;
    private readonly logicalHeight: number;
    private readonly mode: ResponsiveMode;
    private paddings: Required<TPaddings>;
    private readonly scaleMultiplier: number;

    constructor(renderer: IRenderer, options: TResponsiveOptions) {
        super();

        this.renderer = renderer;
        this.logicalWidth = options.logicalWidth;
        this.logicalHeight = options.logicalHeight;
        this.mode = options.mode;
        this.scaleMultiplier = options.scaleMultiplier ?? 1;

        this.paddings = {
            top: options.paddings?.top ?? 0,
            bottom: options.paddings?.bottom ?? 0,
            left: options.paddings?.left ?? 0,
            right: options.paddings?.right ?? 0,
        };

        this.resize();
        this.renderer.on("resize", this.resize, this);
    }

    public setPaddings(paddings: TPaddings) {
        this.paddings = {
            top: paddings.top ?? this.paddings.top,
            bottom: paddings.bottom ?? this.paddings.bottom,
            left: paddings.left ?? this.paddings.left,
            right: paddings.right ?? this.paddings.right,
        };
        this.resize();
    }

    private resize() {
        const screenWidth = this.renderer.screen.width;
        const screenHeight = this.renderer.screen.height;

        const availableWidth = screenWidth - (this.paddings.left + this.paddings.right);
        const availableHeight = screenHeight - (this.paddings.top + this.paddings.bottom);

        if (availableWidth <= 0 || availableHeight <= 0) {
            this.visible = false;
            return;
        }
        this.visible = true;

        const availableRatio = availableWidth / availableHeight;
        const logicalRatio = this.logicalWidth / this.logicalHeight;

        const widthCoeff = availableWidth / this.logicalWidth;
        const heightCoeff = availableHeight / this.logicalHeight;

        let scale = 1.0;

        if (this.mode === ResponsiveMode.cover) {
            scale = availableRatio > logicalRatio ? widthCoeff : heightCoeff;
        } else if (this.mode === ResponsiveMode.contain) {
            scale = availableRatio > logicalRatio ? heightCoeff : widthCoeff;
        }

        scale *= this.scaleMultiplier;
        this.scale.set(scale);

        this.x = this.paddings.left + (availableWidth - (this.logicalWidth * scale)) / 2;
        this.y = this.paddings.top + (availableHeight - (this.logicalHeight * scale)) / 2;
    }

    public override destroy(options?: IDestroyOptions) {
        this.renderer.off("resize", this.resize, this);
        super.destroy(options);
    }
}