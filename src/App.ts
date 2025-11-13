import { type Application } from "pixi.js";
import { SceneLayerManager } from "./core/SceneLayerManager";
import { AssetManager } from "./core/AssetManager";
import { ResponsiveContainer, ResponsiveMode } from "./view/ResponsiveContainer";
import { SceneFactory } from "./core/SceneFactory";

export class App {
    public readonly app: Application;
    public readonly sceneLayerManager: SceneLayerManager;
    private readonly sceneFactory: SceneFactory;
    public gameContainer: ResponsiveContainer | null = null;

    constructor(app: Application) {
        this.app = app;
        this.sceneLayerManager = new SceneLayerManager(this.app);
        this.sceneFactory = new SceneFactory(this.app.renderer);

        void this.setup();
        this.initDevTools();
    }

    private async setup() {
        const textures = await AssetManager.loadCoreAssets();
        const background = this.sceneFactory.createResponsiveContainer(textures.background, ResponsiveMode.cover);

        this.gameContainer = this.sceneFactory.createResponsiveContainer(textures.gameMap, ResponsiveMode.contain);

        this.sceneLayerManager.backgroundLayer.addChild(background);
        this.sceneLayerManager.mainLayer.addChild(this.gameContainer);
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init().initGUI();
        }
    }
}