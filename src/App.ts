import { type Application } from "pixi.js";
import { SceneLayerManager } from "./core/SceneLayerManager";
import { AssetManager } from "./core/AssetManager";
import { ResponsiveContainer, ResponsiveMode } from "./view/ResponsiveContainer";
import { SceneFactory } from "./core/SceneFactory";
import { AnimatedSpriteService} from "./services/AnimatedSpriteService";
import { EntityManager } from "./game/EntityManager";
import { GameConstants } from "./constants/GameConstants";
import { SpriteService } from "./services/SpriteService";
import { TowerPlacementController } from "./game/TowerPlacementController";

export class App {
    public readonly app: Application;
    public readonly sceneLayerManager: SceneLayerManager;
    private readonly sceneFactory: SceneFactory;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly spriteService: SpriteService;
    public gameContainer: ResponsiveContainer | null = null;
    private entityManager!: EntityManager; // how we can get rid of "!" ?

    constructor(app: Application) {
        this.app = app;
        this.sceneLayerManager = new SceneLayerManager(this.app);
        this.sceneFactory = new SceneFactory(this.app.renderer);
        this.animatedSpriteService = new AnimatedSpriteService();
        this.spriteService = new SpriteService();

        this.setup().then(() => {
            this.runInitialEffects();
        })
        this.initDevTools();
    }

    private async setup() {
        const textures = await AssetManager.loadCoreAssets();
        await AssetManager.loadGameAssets();

        const background = this.sceneFactory.createResponsiveContainer(textures.background, ResponsiveMode.cover);

        this.gameContainer = this.sceneFactory.createResponsiveContainer(textures.gameMap, ResponsiveMode.contain);
        this.gameContainer.eventMode = "static";

        this.sceneLayerManager.backgroundLayer.addChild(background);
        this.sceneLayerManager.mainLayer.addChild(this.gameContainer);

        this.entityManager = new EntityManager(this.gameContainer, this.animatedSpriteService, this.spriteService);

        new TowerPlacementController(
            this.gameContainer,
            this.entityManager,
            this.spriteService
        ).init();
    }

    private runInitialEffects() {
        GameConstants.FLAME_POSITIONS.forEach(position => {
            this.entityManager.addFlame({
                position,
                scale: 0.1,
                width: 60,
                animationSpeed: 0.3
            });
        });
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init().initGUI();
        }
    }
}