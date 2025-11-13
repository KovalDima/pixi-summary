import { Application, Container } from "pixi.js";

export class SceneLayerManager {
    public readonly backgroundLayer: Container;
    public readonly mainLayer: Container;
    public readonly uiLayer: Container;

    constructor(app: Application) {
        this.backgroundLayer = new Container();
        this.backgroundLayer.name = "backgroundLayer";

        this.mainLayer = new Container();
        this.mainLayer.name = "mainLayer";

        this.uiLayer = new Container();
        this.uiLayer.name = "uiLayer";

        app.stage.addChild(
            this.backgroundLayer,
            this.mainLayer,
            this.uiLayer
        );
    }
}