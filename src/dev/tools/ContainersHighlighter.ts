import { type Application, Container, Graphics, type DisplayObject } from "pixi.js";
import {Config} from "../../Config";

export class ContainersHighlighter {
    private app: Application;
    private readonly graphics: Graphics;
    public enabled: boolean = false;

    constructor(app: Application) {
        this.app = app;
        this.graphics = new Graphics();
        this.app.stage.addChild(this.graphics);
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!this.enabled) {
            this.graphics.clear();
        }
    }

    public update() {
        if (!this.enabled) {
            return;
        }

        this.graphics.clear();
        this.highlightContainers(this.app.stage);
    }

    private highlightContainers(displayObject: DisplayObject) {
        if (displayObject !== this.app.stage) {
            const bounds = displayObject.getBounds();
            const borderWidth = 3;
            const borderColor = Config.colors.Yellow;
            this.graphics.lineStyle(borderWidth, borderColor);
            this.graphics.drawRect(
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height
            );
        }

        if (displayObject instanceof Container) {
            for (const child of displayObject.children) {
                this.highlightContainers(child);
            }
        }
    }
}