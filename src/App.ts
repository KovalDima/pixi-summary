import { type Application } from "pixi.js";
import { SceneLayerManager } from "./core/scene/SceneLayerManager";
import { AssetManager } from "./core/AssetManager";
import { ResponsiveContainer, ResponsiveMode } from "./view/ResponsiveContainer";
import { SceneFactory } from "./core/scene/SceneFactory";
import { AnimatedSpriteService} from "./services/AnimatedSpriteService";
import { EntityManager } from "./game/EntityManager";
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
import { WaveManager } from "./game/waves/WaveManager";
import { ParticleService } from "./services/ParticleService";
import { DropManager } from "./game/effects/DropManager";
import { StartScreen } from "./view/StartScreen";
import { AssetsConstants } from "./constants/AssetsConstants";

export class App {
    public readonly app: Application;
    public readonly sceneLayerManager: SceneLayerManager;
    private readonly sceneFactory: SceneFactory;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly economyService: EconomyService;
    private readonly bitmapTextService: BitmapTextService;
    private readonly particleService: ParticleService;
    private dropManager: DropManager | null = null;
    public gameContainer: ResponsiveContainer | null = null;
    public magicGate: MagicGate | null = null;
    // TODO:
    //  make private again
    public entityManager: EntityManager | null = null;
    private towerManager: TowerManager | null = null;
    private projectileManager: ProjectileManager | null = null;
    private boosterManager: BoosterManager | null = null;
    private objectPlacementController: ObjectPlacementController | null = null;
    private waveManager: WaveManager | null = null;
    private uiManager: UIManager | null = null;
    private startScreen: StartScreen | null = null;
    private sessionKilledEnemies: number = 0;
    private readonly domEventHelper: DomEventHelper;
    private gameLoopCallback: ((delta: number) => void) | null = null;

    constructor(app: Application) {
        this.app = app;
        this.sceneLayerManager = new SceneLayerManager(this.app);
        this.sceneFactory = new SceneFactory(this.app.renderer);
        this.animatedSpriteService = new AnimatedSpriteService();
        this.spriteService = new SpriteService();
        this.soundService = new SoundService();
        this.bitmapTextService = new BitmapTextService();
        this.economyService = new EconomyService();
        this.domEventHelper = new DomEventHelper();
        this.particleService = new ParticleService();

        this.app.stage.eventMode = "static";

        void this.setup();
        this.initDevTools();
    }

    private async setup() {
        const textures = await AssetManager.loadCoreAssets();
        await AssetManager.loadGameAssets();
        this.bitmapTextService.init();

        const mapScale = 1.1;
        const background = this.sceneFactory.createResponsiveContainer(textures.background, ResponsiveMode.cover);

        this.gameContainer = this.sceneFactory.createResponsiveContainer(
            textures.gameMap,
            ResponsiveMode.contain,
            { top: 60, bottom: 60 },
            mapScale
        );
        this.gameContainer.eventMode = "static";
        this.gameContainer.sortableChildren = true;

        this.sceneLayerManager.backgroundLayer.addChild(background);
        this.sceneLayerManager.mainLayer.addChild(this.gameContainer);

        const highlightService = new HighlightService(this.gameContainer);

        this.projectileManager = new ProjectileManager(this.gameContainer);

        this.entityManager = new EntityManager(
            this.gameContainer,
            (damage) => this.onEnemyReachedFinish(damage)
        );

        this.createMagicGate();

        this.waveManager = new WaveManager(this.entityManager);

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
            this.app.stage,
            this.towerManager,
            this.boosterManager,
            this.spriteService,
            this.domEventHelper,
            this.soundService,
            this.economyService
        );

        this.uiManager = new UIManager(
            this.sceneLayerManager.uiLayer,
            this.app.renderer,
            this.economyService,
            this.objectPlacementController,
            this.spriteService,
            this.soundService,
            this.bitmapTextService,
            this.waveManager,
            () => this.waveManager?.startNextWave()
        );
        this.uiManager.init(this.gameContainer);

        this.dropManager = new DropManager(
            this.gameContainer,
            this.sceneLayerManager.uiLayer,
            this.spriteService,
            this.particleService,
            () => this.uiManager?.getBalancePosition() ?? { x: 0, y: 0 }
        );

        this.waveManager.onWaveChange = (wave) => {
            this.uiManager?.updateWaveInfo(wave, 0);
        };

        this.waveManager.onWaveTimerUpdate = (timeLeft) => {
            this.uiManager?.updateWaveInfo(this.waveManager!["currentWave"], timeLeft);
        };

        this.entityManager.on("enemy_killed_at", (data: { position: {x: number, y: number}, reward: number }) => {
            this.sessionKilledEnemies++;

            if (this.dropManager) {
                this.dropManager.spawnCoin(data.position, () => {
                    this.economyService.addMoney(data.reward);
                });
            } else {
                this.economyService.addMoney(data.reward);
            }
        });

        this.showStartScreen();
    }

    private showStartScreen() {
        this.startScreen = new StartScreen(
            this.spriteService,
            this.app.renderer,
            () => this.startGame()
        );
        this.sceneLayerManager.uiLayer.addChild(this.startScreen);
    }

    private startGame() {
        if (this.startScreen) {
            this.startScreen.destroy();
            this.startScreen = null;
        }
        this.startGameLoop();
        this.soundService.playLoop(AssetsConstants.SOUND_GAME_LOOP);
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
        if (this.gameLoopCallback) {
            this.app.ticker.remove(this.gameLoopCallback);
            this.gameLoopCallback = null;
        }

        this.soundService.stop(AssetsConstants.SOUND_GAME_LOOP);
        this.soundService.play(AssetsConstants.SOUND_GAME_OVER);

        const popup = new GameOverPopup(
            this.app.screen.width,
            this.app.screen.height,
            this.bitmapTextService,
            this.animatedSpriteService,
            {
                score: this.economyService.getTotalEarned(),
                killed: this.sessionKilledEnemies
            },
            () => window.location.reload()
        );
        this.sceneLayerManager.uiLayer.addChild(popup);
    }

    private startGameLoop() {
        this.gameLoopCallback = (delta: number) => {
            this.entityManager?.update(delta);
            this.waveManager?.update(delta);

            if (this.projectileManager) {
                this.projectileManager.update(delta);
            }

            if (this.towerManager && this.entityManager) {
                this.towerManager.update(delta, this.entityManager.getEnemies());
            }

            this.particleService.update(delta);
        };

        this.app.ticker.add(this.gameLoopCallback);
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init().initGUI();
        }
    }
}