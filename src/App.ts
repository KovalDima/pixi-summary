import { type Application } from "pixi.js";
import { SceneLayerManager } from "./core/scene/SceneLayerManager";
import { AssetManager } from "./core/AssetManager";
import { ResponsiveContainer, ResponsiveMode } from "./view/ResponsiveContainer";
import { SceneFactory } from "./core/scene/SceneFactory";
import { AnimatedSpriteService} from "./services/AnimatedSpriteService";
import { EntityManager } from "./game/EntityManager";
import { GameConstants } from "./constants/GameConstants";
import { SpriteService } from "./services/SpriteService";
import { ObjectPlacementController } from "./game/placement/ObjectPlacementController";
import { DomEventHelper } from "./helpers/DomEventHelper";
import { SoundService } from "./services/SoundService";
import { EconomyService } from "./services/EconomyService";
import { UIManager } from "./game/ui/UIManager";
import { TowerManager } from "./game/towers/TowerManager";
import { BoosterManager } from "./game/boosters/BoosterManager";
import { HighlightService } from "./services/HighlightService";
import { ProjectileManager } from "./game/projectiles/ProjectileManager";
import { MagicGate } from "./game/entities/MagicGate";
import { MapConfig } from "./configs/MapConfig";
import { GameOverPopup } from "./game/ui/GameOverPopup";
import { BitmapTextService } from "./services/BitmapTextService";

export class App {
    public readonly app: Application;
    public readonly sceneLayerManager: SceneLayerManager;
    private readonly sceneFactory: SceneFactory;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly economyService: EconomyService;
    private readonly bitmapTextService: BitmapTextService;
    public gameContainer: ResponsiveContainer | null = null;
    public magicGate: MagicGate | null = null;
    // TODO:
    //  make private again
    public entityManager: EntityManager | null = null;
    private towerManager: TowerManager | null = null;
    private projectileManager: ProjectileManager | null = null;
    private boosterManager: BoosterManager | null = null;
    private objectPlacementController: ObjectPlacementController | null = null;
    private readonly domEventHelper: DomEventHelper;

    constructor(app: Application) {
        this.app = app;
        this.sceneLayerManager = new SceneLayerManager(this.app);
        this.sceneFactory = new SceneFactory(this.app.renderer);
        this.animatedSpriteService = new AnimatedSpriteService();
        this.spriteService = new SpriteService();
        this.soundService = new SoundService();
        this.bitmapTextService = new BitmapTextService();
        this.economyService = new EconomyService(1500);
        this.domEventHelper = new DomEventHelper();

        this.setup().then(() => {
            this.runInitialEffects();
        });
        this.initDevTools();
    }

    private async setup() {
        const textures = await AssetManager.loadCoreAssets();
        await AssetManager.loadGameAssets();
        this.bitmapTextService.init();

        const background = this.sceneFactory.createResponsiveContainer(textures.background, ResponsiveMode.cover);

        this.gameContainer = this.sceneFactory.createResponsiveContainer(textures.gameMap, ResponsiveMode.contain, { top: 80, bottom: 80 });
        this.gameContainer.eventMode = "static";
        this.gameContainer.sortableChildren = true;

        this.sceneLayerManager.backgroundLayer.addChild(background);
        this.sceneLayerManager.mainLayer.addChild(this.gameContainer);

        const highlightService = new HighlightService(this.gameContainer);

        this.projectileManager = new ProjectileManager(this.gameContainer, this.spriteService);

        this.entityManager = new EntityManager(
            this.gameContainer,
            this.animatedSpriteService,
            this.spriteService,
            this.economyService,
            (damage) => this.onEnemyReachedFinish(damage)
        );

        this.createMagicGate();

        this.towerManager = new TowerManager(
            this.gameContainer,
            this.spriteService,
            this.animatedSpriteService,
            this.soundService,
            highlightService,
            this.projectileManager
        );

        this.boosterManager = new BoosterManager(
            this.gameContainer,
            this.spriteService,
            this.soundService,
            this.entityManager,
            highlightService
        );

        this.objectPlacementController = new ObjectPlacementController(
            this.gameContainer,
            this.towerManager,
            this.boosterManager,
            this.spriteService,
            this.domEventHelper,
            this.soundService,
        );

        new UIManager(
            this.sceneLayerManager.uiLayer,
            this.app.renderer,
            this.economyService,
            this.objectPlacementController,
            this.spriteService,
            this.soundService,
            this.bitmapTextService
        ).init(this.gameContainer);

        this.startGameLoop();
    }

    private createMagicGate() {
        if (!this.gameContainer) {
            return;
        }

        const finishPoint = MapConfig.getFinishNodePosition();

        this.magicGate = new MagicGate(this.spriteService);
        this.magicGate.position.copyFrom(finishPoint);
        this.magicGate.zIndex = finishPoint.y;
        this.gameContainer.addChild(this.magicGate);
        this.gameContainer.sortChildren();
    }

    private onEnemyReachedFinish(damage: number) {
        if (!this.magicGate) {
            return;
        }

        this.magicGate.takeDamage(damage);

        if (this.magicGate.checkDestroyed()) {
            this.handleGameOver();
        }
    }

    private handleGameOver() {
        this.app.ticker.stop();
        const popup = new GameOverPopup(this.app.screen.width, this.app.screen.height, this.bitmapTextService);
        this.sceneLayerManager.uiLayer.addChild(popup);
    }

    private runInitialEffects() {
        GameConstants.FLAME_POSITIONS.forEach(position => {
            this.entityManager?.addFlame({
                position,
                scale: 0.1,
                width: 60,
                animationSpeed: 0.3
            });
        });
    }

    private startGameLoop() {
        this.app.ticker.add((delta) => {
            this.entityManager?.update(delta);

            if (this.projectileManager) {
                this.projectileManager.update(delta);
            }

            if (this.towerManager && this.entityManager) {
                this.towerManager.update(delta, this.entityManager.getEnemies());
            }
        });
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init().initGUI();
        }
    }
}