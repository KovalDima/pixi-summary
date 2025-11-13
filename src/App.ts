import { type Application } from "pixi.js";
import { SceneLayerManager } from "./core/SceneManager";
import { AssetManager } from "./core/AssetManager";
import { Background } from "./view/Background";

export class App {
    public readonly app: Application;
    public readonly sceneLayerManager: SceneLayerManager;

    constructor(app: Application) {
        this.app = app;
        this.sceneLayerManager = new SceneLayerManager(this.app);

        void this.setup();
        this.initDevTools();
    }

    private async setup() {
        const textures = await AssetManager.loadCoreAssets();
        const background = new Background(textures.background, this.app.renderer);

        this.sceneLayerManager.backgroundLayer.addChild(background);
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init().initGUI();
        }
    }
}