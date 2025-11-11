import {type Application, Graphics} from "pixi.js";
import {Config} from "./Config";

export class App {
    public readonly app: Application;

    constructor(app: Application) {
        this.app = app;
        this.initDevTools();

        // test highlighting
        const rectangle = new Graphics();
        const smallRectangle = new Graphics();
        rectangle.beginFill(Config.colors.Red);
        rectangle.drawRect(0, 0, 600, 600);
        rectangle.endFill();
        this.app.stage.addChild(rectangle);
        smallRectangle.beginFill(Config.colors.Blue);
        smallRectangle.drawRect(0, 0, 300, 300);
        smallRectangle.endFill();
        rectangle.addChild(smallRectangle)
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init().initGUI();
        }
    }
}