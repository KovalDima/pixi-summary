import { type Application } from "pixi.js";
import { SceneLayerManager } from "./core/scene/SceneLayerManager";
import { AssetManager } from "./core/AssetManager";
import { ResponsiveContainer, ResponsiveMode } from "./view/ResponsiveContainer";
import { SceneFactory } from "./core/scene/SceneFactory";
import { AnimatedSpriteService} from "./services/AnimatedSpriteService";
import { EntityManager } from "./game/EntityManager";
import { GameConstants } from "./constants/GameConstants";
import { SpriteService } from "./services/SpriteService";
import { ObjectPlacementController } from "./game/ObjectPlacementController";
import { DomEventHelper } from "./helpers/DomEventHelper";
import { SoundService } from "./services/SoundService";
import { EconomyService } from "./services/EconomyService";
import { UIManager } from "./game/ui/UIManager";

export class App {
    public readonly app: Application;
    public readonly sceneLayerManager: SceneLayerManager;
    private readonly sceneFactory: SceneFactory;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly economyService: EconomyService;
    private readonly uiManager: UIManager;
    public gameContainer: ResponsiveContainer | null = null;
    // TODO:
    //  make private again
    public entityManager!: EntityManager; // how we can get rid of "!" ?
    private readonly domEventHelper: DomEventHelper;

    constructor(app: Application) {
        this.app = app;
        this.sceneLayerManager = new SceneLayerManager(this.app);
        this.sceneFactory = new SceneFactory(this.app.renderer);
        this.animatedSpriteService = new AnimatedSpriteService();
        this.spriteService = new SpriteService();
        this.soundService = new SoundService();
        this.economyService = new EconomyService(1500);
        this.uiManager = new UIManager(this.sceneLayerManager.uiLayer, this.economyService);
        this.domEventHelper = new DomEventHelper();
        this.soundService = new SoundService();

        this.setup().then(() => {
            this.runInitialEffects();
        });
        this.initDevTools();
    }

    private async setup() {
        const textures = await AssetManager.loadCoreAssets();
        await AssetManager.loadGameAssets();

        const background = this.sceneFactory.createResponsiveContainer(textures.background, ResponsiveMode.cover);

        this.gameContainer = this.sceneFactory.createResponsiveContainer(textures.gameMap, ResponsiveMode.contain, { top: 80, bottom: 80 });
        this.gameContainer.eventMode = "static";
        this.gameContainer.sortableChildren = true;

        this.sceneLayerManager.backgroundLayer.addChild(background);
        this.sceneLayerManager.mainLayer.addChild(this.gameContainer);

        this.uiManager.init(this.gameContainer);

        this.entityManager = new EntityManager(
            this.gameContainer,
            this.animatedSpriteService,
            this.spriteService,
            this.soundService,
        );

        new ObjectPlacementController(
            this.gameContainer,
            this.entityManager,
            this.spriteService,
            this.domEventHelper,
            this.soundService,
        );

        this.startGameLoop();
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

    private startGameLoop() {
        this.app.ticker.add((delta) => {
            this.entityManager.update(delta);
        });
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init().initGUI();
        }
    }
}