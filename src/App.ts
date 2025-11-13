import { type Application, type Texture, Container, Sprite } from "pixi.js";
import { SceneLayerManager } from "./core/SceneLayerManager";
import { AssetManager } from "./core/AssetManager";
import {ResponsiveContainer, type TResponsiveMode} from "./view/ResponsiveContainer";

export class App {
    public readonly app: Application;
    public readonly sceneLayerManager: SceneLayerManager;
    public gameContainer: ResponsiveContainer;

    constructor(app: Application) {
        this.app = app;
        this.sceneLayerManager = new SceneLayerManager(this.app);
        this.gameContainer = new ResponsiveContainer(this.app.renderer);

        void this.setup();
        this.initDevTools();
    }

    private async setup() {
        const textures = await AssetManager.loadCoreAssets();
        const background = this.createResponsiveContainer(textures.background, "cover");

        this.gameContainer = this.createResponsiveContainer(textures.gameMap, "contain");

        this.sceneLayerManager.backgroundLayer.addChild(background);
        this.sceneLayerManager.mainLayer.addChild(this.gameContainer);
    }

    private createResponsiveContainer(texture: Texture, mode: TResponsiveMode) {
        const container = new ResponsiveContainer(this.app.renderer, {
            logicalWidth: texture.width,
            logicalHeight: texture.height,
            mode
        });

        container.addChild(new Sprite(texture));
        return container;
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init().initGUI();
        }
    }
}