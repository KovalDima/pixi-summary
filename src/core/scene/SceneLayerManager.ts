import { Application, Container } from "pixi.js";
import { SceneLayerConstants } from "../../constants/SceneLayerConstants";

export class SceneLayerManager {
    public readonly backgroundLayer: Container;
    public readonly mainLayer: Container;
    public readonly uiLayer: Container;

    constructor(app: Application) {
        this.backgroundLayer = new Container();
        this.backgroundLayer.name = SceneLayerConstants.BACKGROUND_LAYER;

        this.mainLayer = new Container();
        this.mainLayer.name = SceneLayerConstants.MAIN_LAYER;

        this.uiLayer = new Container();
        this.uiLayer.name = SceneLayerConstants.UI_LAYER;

        app.stage.addChild(
            this.backgroundLayer,
            this.mainLayer,
            this.uiLayer
        );
    }
}