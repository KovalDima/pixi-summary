import { Container, Graphics, type IPointData } from "pixi.js";

export type THighlightStyle = {
    color: number,
    alpha: number,
    radius: number,
    lineWidth?: number,
    lineColor?: number,
    lineAlpha?: number,
}

export class HighlightService {
    private readonly container: Container;
    private activeHighlights: Graphics[] = [];

    constructor(container: Container) {
        this.container = container;
    }

    public show(positions: IPointData[], style: THighlightStyle) {
        this.clear();

        positions.forEach(position => {
            const graphics = this.createGraphic(style);

            graphics.position.copyFrom(position);
            graphics.zIndex = 0;

            this.container.addChild(graphics);
            this.activeHighlights.push(graphics);
        });
    }

    public clear() {
        this.activeHighlights.forEach((graphic) => graphic.destroy());
        this.activeHighlights = [];
    }

    private createGraphic(style: THighlightStyle) {
        const graphics = new Graphics();

        if (style.lineWidth && style.lineColor) {
            graphics.lineStyle(style.lineWidth, style.lineColor, style.lineAlpha ?? 1);
        }

        graphics.beginFill(style.color, style.alpha);
        graphics.drawCircle(0, 0, style.radius);
        graphics.endFill();

        return graphics;
    }
}