import { Container, type IRenderer, type Sprite, BitmapText } from "pixi.js";
import { GameConstants } from "../../constants/GameConstants";
import { TowerRegistry } from "../towers/TowerRegistry";
import { AssetsConstants } from "../../constants/AssetsConstants";
import type { EconomyService } from "../../services/EconomyService";
import { ObjectPlacementController, PlaceableItemType } from "../placement/ObjectPlacementController";
import { SpriteService } from "../../services/SpriteService";
import type { SoundService } from "../../services/SoundService";
import { BoosterRegistry } from "../boosters/BoosterRegistry";
import type { BitmapTextService } from "../../services/BitmapTextService";
import { TopInfoPanel } from "./TopInfoPanel";
import { ItemsPanel } from "./ItemsPanel";
import { NextWaveButton } from "./NextWaveButton";
import { ItemSlot } from "./ItemSlot";
import type { ResponsiveContainer } from "../../view/ResponsiveContainer";
import { WaveManager, WaveState } from "../waves/WaveManager";
import { Config } from "../../Config";
import gsap from "gsap";

export class UIManager {
    private readonly uiLayer: Container;
    private readonly renderer: IRenderer;
    private readonly economyService: EconomyService;
    private readonly placementController: ObjectPlacementController;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly bitmapTextService: BitmapTextService;
    private readonly waveManager: WaveManager;

    private topInfoPanel: TopInfoPanel | null = null;
    private towersPanel: ItemsPanel | null = null;
    private boostersPanel: ItemsPanel | null = null;
    private nextWaveButton: NextWaveButton | null = null;
    private muteButton: Sprite | null = null;
    private gameContainer: ResponsiveContainer | null = null;
    private warningLabel: BitmapText | null = null;
    private isWarningShown: boolean = false;

    private readonly onNextWaveClick: () => void;

    constructor(
        uiLayer: Container,
        renderer: IRenderer,
        economyService: EconomyService,
        placementController: ObjectPlacementController,
        spriteService: SpriteService,
        soundService: SoundService,
        bitmapTextService: BitmapTextService,
        waveManager: WaveManager,
        onNextWaveClick: () => void
    ) {
        this.uiLayer = uiLayer;
        this.renderer = renderer;
        this.economyService = economyService;
        this.placementController = placementController;
        this.spriteService = spriteService;
        this.soundService = soundService;
        this.bitmapTextService = bitmapTextService;
        this.waveManager = waveManager;
        this.onNextWaveClick = onNextWaveClick;
    }

    public init(gameContainer: ResponsiveContainer) {
        this.gameContainer = gameContainer;

        this.createTopPanel();
        this.createTowersPanel();
        this.createBoostersPanel();
        this.createNextWaveButton();
        this.createMuteButton();
        this.createWarningLabel();

        this.waveManager.onStateChange = (state: WaveState) => {
            this.nextWaveButton?.setEnabled(state !== WaveState.SPAWNING);
        };

        this.economyService.on("balance_changed", (balance: number) => {
            this.topInfoPanel?.updateBalance(balance);
        });

        this.waveManager.on("wave_progress", (data: {killed: number, total: number}) => {
            this.topInfoPanel?.updateKilled(data.killed, data.total);
        });

        this.topInfoPanel?.updateBalance(this.economyService.getBalance());

        this.renderer.on("resize", this.updateLayout, this);
        this.updateLayout();
    }

    public updateWaveInfo(waveIndex: number, timeToNextWave: number) {
        if (this.topInfoPanel) {
            this.topInfoPanel.updateWave(waveIndex);
            this.topInfoPanel.updateNextWaveTimer(timeToNextWave);
        }

        if (timeToNextWave > 5) {
            this.isWarningShown = false;
        }

        if (timeToNextWave <= 5 && timeToNextWave > 0 && !this.isWarningShown) {
            this.showWarning();
        }
    }

    private createWarningLabel() {
        this.warningLabel = this.bitmapTextService.createText("Next wave is cominG", {
            fontSize: 50,
            tint: Config.colors.Yellow,
        });
        this.warningLabel.anchor.set(0.5);
        this.warningLabel.alpha = 0;
        this.uiLayer.addChild(this.warningLabel);
    }

    private showWarning() {
        if (!this.warningLabel) {
            return;
        }

        const centerX = this.renderer.screen.width / 2;
        const centerY = this.renderer.screen.height / 2;

        this.isWarningShown = true;
        this.warningLabel.position.set(centerX, centerY);
        this.warningLabel.alpha = 1;

        gsap.delayedCall(1, () => {
            if (this.warningLabel) {
                gsap.to(this.warningLabel, {
                    alpha: 0,
                    duration: 0.3
                });
            }
        });
    }

    public getBalancePosition() {
        if (this.topInfoPanel) {
            return this.topInfoPanel.getBalanceGlobalPosition();
        }
        return { x: 0, y: 0 };
    }

    private createTopPanel() {
        this.topInfoPanel = new TopInfoPanel(this.spriteService, this.bitmapTextService);
        this.uiLayer.addChild(this.topInfoPanel);
    }

    private createTowersPanel() {
        this.towersPanel = new ItemsPanel(this.spriteService, "Towers", this.bitmapTextService);
        this.uiLayer.addChild(this.towersPanel);

        GameConstants.TOWER_BUTTONS.forEach((type) => {
            const config = TowerRegistry.getData(type);
            if (!config) {
                return;
            }

            const slot = new ItemSlot(
                this.spriteService,
                this.bitmapTextService,
                { iconAlias: config.iconAlias, price: config.price },
                () => {
                    this.soundService.play(AssetsConstants.SOUND_CLICK);
                    const globalPos = slot.getGlobalPosition();
                    this.placementController.startPlacing({
                        type: PlaceableItemType.TOWER,
                        config: config,
                        iconAlias: config.iconAlias
                    }, globalPos);
                }
            );
            this.towersPanel?.addItem(slot);
        });
    }

    private createBoostersPanel() {
        this.boostersPanel = new ItemsPanel(this.spriteService, "Boosters", this.bitmapTextService);
        this.uiLayer.addChild(this.boostersPanel);

        GameConstants.BOOSTER_BUTTONS.forEach((type) => {
            const config = BoosterRegistry.getData(type);
            if (!config) {
                return;
            }

            const slot = new ItemSlot(
                this.spriteService,
                this.bitmapTextService,
                { iconAlias: config.iconAlias, price: config.price },
                () => {
                    this.soundService.play(AssetsConstants.SOUND_CLICK);
                    const globalPos = slot.getGlobalPosition();
                    this.placementController.startPlacing({
                        type: PlaceableItemType.BOOSTER,
                        config: config,
                        iconAlias: config.iconAlias
                    }, globalPos);
                }
            );
            this.boostersPanel?.addItem(slot);
        });
    }

    private createNextWaveButton() {
        this.nextWaveButton = new NextWaveButton(
            this.spriteService,
            this.bitmapTextService,
            () => {
                if (this.waveManager.getTimeToNextWave() > 0) {
                    this.economyService.addMoney(50);
                    this.nextWaveButton?.showBonusLabel();
                }
                this.soundService.play(AssetsConstants.SOUND_CLICK);
                this.onNextWaveClick();
            }
        );
        this.uiLayer.addChild(this.nextWaveButton);
    }

    private createMuteButton() {
        this.muteButton = this.spriteService.createSprite(AssetsConstants.UI_MUTE_BTN_ALIAS);
        this.muteButton.eventMode = "static";
        this.muteButton.cursor = "pointer";
        this.muteButton.scale.set(0.6);

        this.muteButton.on("pointerdown", () => {
            const isMuted = this.soundService.toggleMute();
            if (this.muteButton) {
                this.muteButton.alpha = isMuted ? 0.5 : 1.0;
            }
        });

        this.uiLayer.addChild(this.muteButton);
    }

    private updateLayout() {
        if (!this.topInfoPanel || !this.towersPanel || !this.boostersPanel || !this.nextWaveButton || !this.gameContainer || !this.muteButton) {
            return;
        }

        const screenWidth = this.renderer.screen.width;
        const screenHeight = this.renderer.screen.height;
        const padding = 10;

        let uiScale = 1;
        const topPanelOriginalWidth = this.topInfoPanel.width;
        const minScreenForFullSize = topPanelOriginalWidth + (padding * 2);

        if (screenWidth < minScreenForFullSize) {
            uiScale = screenWidth / minScreenForFullSize;
        }

        uiScale = Math.min(uiScale, 1.2);

        this.topInfoPanel.scale.set(uiScale);
        this.towersPanel.scale.set(uiScale);
        this.boostersPanel.scale.set(uiScale);
        this.nextWaveButton.scale.set(uiScale);

        this.topInfoPanel.position.set(screenWidth / 2, 0);

        const scaledTopPanelWidth = topPanelOriginalWidth * uiScale;
        const topPanelLeftX = (screenWidth - scaledTopPanelWidth) / 2;
        const topPanelRightX = topPanelLeftX + scaledTopPanelWidth;

        this.towersPanel.position.set(
            topPanelLeftX + (this.towersPanel.width * uiScale) / 2,
            screenHeight - (this.towersPanel.height * uiScale) / 2 - padding
        );

        this.boostersPanel.position.set(
            topPanelRightX - (this.boostersPanel.width * uiScale) / 2,
            screenHeight - (this.boostersPanel.height * uiScale) / 2 - padding
        );

        this.nextWaveButton.position.set(
            screenWidth / 2,
            screenHeight - (this.nextWaveButton.height * uiScale) / 2 - padding
        );

        const muteMargin = 25;
        this.muteButton.position.set(
            screenWidth - muteMargin - (this.muteButton.width / 2),
            muteMargin + (this.muteButton.height / 2)
        );

        const topHeight = this.topInfoPanel.height * uiScale;
        const bottomHeight = Math.max(
            this.towersPanel.height,
            this.boostersPanel.height
        ) * uiScale + (padding * 2);

        this.gameContainer.setPaddings({
            top: topHeight,
            bottom: bottomHeight,
            left: 0,
            right: 0
        });
    }

    public destroy() {
        this.renderer.off("resize", this.updateLayout, this);
    }
}