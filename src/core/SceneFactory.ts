import { type IRenderer, type Texture, Sprite } from "pixi.js";
import { ResponsiveContainer, ResponsiveMode, type TPaddings } from "../view/ResponsiveContainer";

export class SceneFactory {
    private readonly renderer: IRenderer;

    constructor(renderer: IRenderer) {
        this.renderer = renderer;
    }

    public createResponsiveContainer(texture: Texture, mode: ResponsiveMode, paddings?: TPaddings) {
        const container = new ResponsiveContainer(this.renderer, {
            logicalWidth: texture.width,
            logicalHeight: texture.height,
            mode,
            paddings,
        });

        container.addChild(new Sprite(texture));
        return container;
    }
}