// import { Container, BitmapText, Text, TextStyle, type IPointData } from "pixi.js";
// import { GameConstants } from "../../constants/GameConstants";
// import { FontStyles } from "../../constants/FontStyles";
// import { TowerRegistry } from "../towers/TowerRegistry";
// import type { EconomyService } from "../../services/EconomyService";
// import { AssetsConstants } from "../../constants/AssetsConstants";
// import { ObjectPlacementController, PlaceableItemType } from "../placement/ObjectPlacementController";
// import { SpriteService } from "../../services/SpriteService";
// import type { SoundService } from "../../services/SoundService";
// import { BoosterRegistry } from "../boosters/BoosterRegistry";
// import type { BitmapTextService } from "../../services/BitmapTextService";
import { Container, type IPointData, type IRenderer } from "pixi.js";
import { GameConstants } from "../../constants/GameConstants";
import { TowerRegistry } from "../towers/TowerRegistry";
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

export class UIManager {
    private readonly uiLayer: Container;
    private readonly renderer: IRenderer;
    private readonly economyService: EconomyService;
    private readonly placementController: ObjectPlacementController;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly bitmapTextService: BitmapTextService;

    private topInfoPanel: TopInfoPanel | null = null;
    private towersPanel: ItemsPanel | null = null;
    private boostersPanel: ItemsPanel | null = null;
    private nextWaveButton: NextWaveButton | null = null;
    private gameContainer: ResponsiveContainer | null = null;

    constructor(
        uiLayer: Container,
        renderer: IRenderer,
        economyService: EconomyService,
        placementController: ObjectPlacementController,
        spriteService: SpriteService,
        soundService: SoundService,
        bitmapTextService: BitmapTextService
    ) {
        this.uiLayer = uiLayer;
        this.renderer = renderer;
        this.economyService = economyService;
        this.placementController = placementController;
        this.spriteService = spriteService;
        this.soundService = soundService;
        this.bitmapTextService = bitmapTextService;
    }

    public init(gameContainer: ResponsiveContainer) {
        this.gameContainer = gameContainer;

        this.createTopPanel();
        this.createTowersPanel();
        this.createBoostersPanel();
        this.createNextWaveButton();

        this.renderer.on("resize", this.updateLayout, this);
        this.updateLayout();
    }

    private createTopPanel() {
        this.topInfoPanel = new TopInfoPanel(this.spriteService, this.bitmapTextService);
        this.uiLayer.addChild(this.topInfoPanel);
    }

    private createTowersPanel() {
        this.towersPanel = new ItemsPanel(this.spriteService, "Вежі", this.bitmapTextService);
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

        GameConstants.BOOSTER_BUTTON_POSITIONS.forEach((data) => {
            const config = BoosterRegistry.getData(data.type);
            if (!config) return;

            const slot = new ItemSlot(
                this.spriteService,
                this.bitmapTextService,
                { iconAlias: config.iconAlias, price: config.price },
                () => {
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
        this.nextWaveButton = new NextWaveButton(this.spriteService, () => {
            console.log("Next wave clicked");
            // TODO: Call wave manager
        });
        this.uiLayer.addChild(this.nextWaveButton);
    }

    private updateLayout() {
        if (!this.topInfoPanel || !this.towersPanel || !this.boostersPanel || !this.nextWaveButton || !this.gameContainer) {
            return;
        }

        const screenWidth = this.renderer.screen.width;
        const screenHeight = this.renderer.screen.height;
        const padding = 10; // Відступ від країв екрану

        // 1. Розрахунок масштабу UI
        // Якщо екран вужчий за панель - зменшуємо UI
        let uiScale = 1;
        const minWidth = this.topInfoPanel.width + (padding * 2);

        if (screenWidth < minWidth) {
            uiScale = screenWidth / minWidth;
        }

        // Можна також обмежити максимальний розмір UI на великих екранах,
        // щоб кнопки не були гігантськими (наприклад max scale 1.2)
        uiScale = Math.min(uiScale, 1.1);

        // Застосовуємо масштаб до всіх компонентів
        this.topInfoPanel.scale.set(uiScale);
        this.towersPanel.scale.set(uiScale);
        this.boostersPanel.scale.set(uiScale);
        this.nextWaveButton.scale.set(uiScale);

        // 2. Позиціонування

        // Верхня панель - по центру зверху
        this.topInfoPanel.position.set(screenWidth / 2, 0);

        // Вежі - зліва знизу
        // Враховуємо pivot/anchor панелей. У ItemsPanel anchor = 0.5 (центр).
        // Тому x = половина ширини * scale + padding
        this.towersPanel.position.set(
            (this.towersPanel.width * uiScale) / 2 + padding,
            screenHeight - (this.towersPanel.height * uiScale) / 2 - padding
        );

        // Бустери - справа знизу
        this.boostersPanel.position.set(
            screenWidth - (this.boostersPanel.width * uiScale) / 2 - padding,
            screenHeight - (this.boostersPanel.height * uiScale) / 2 - padding
        );

        // Кнопка хвилі - по центру знизу
        this.nextWaveButton.position.set(
            screenWidth / 2,
            screenHeight - (this.nextWaveButton.height * uiScale) / 2 - padding
        );

        // 3. Адаптація карти (Game Map)
        // Ми повинні сказати карті: "Зверху зайнято X пікселів, знизу Y пікселів, впишись посередині"

        const topHeight = this.topInfoPanel.height * uiScale;
        const bottomHeight = Math.max(
            this.towersPanel.height,
            this.boostersPanel.height,
            this.nextWaveButton.height
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

    // // TODO
    // private createTowerButtons(container: Container) {
    //     GameConstants.TOWER_BUTTON_POSITIONS.forEach((data) => {
    //         const config = TowerRegistry.getData(data.type);
    //
    //         if (!config) {
    //             return;
    //         }
    //
    //         this.createButton(
    //             container,
    //             config.iconAlias,
    //             data.position,
    //             (globalPos) => {
    //                 this.placementController.startPlacing({
    //                     type: PlaceableItemType.TOWER,
    //                     config: config,
    //                     iconAlias: config.iconAlias
    //                 }, globalPos);
    //             }
    //         );
    //
    //         this.createPriceLabel(container, config.price, data.position);
    //     });
    // }
    //
    // // TODO
    // private createBoosterButtons(container: Container) {
    //     GameConstants.BOOSTER_BUTTON_POSITIONS.forEach((data) => {
    //         const config = BoosterRegistry.getData(data.type);
    //
    //         if (!config) {
    //             return;
    //         }
    //
    //         this.createButton(
    //             container,
    //             config.iconAlias,
    //             data.position,
    //             (globalPos) => {
    //                 this.placementController.startPlacing({
    //                     type: PlaceableItemType.BOOSTER,
    //                     config: config,
    //                     iconAlias: config.iconAlias
    //                 }, globalPos);
    //             }
    //         );
    //
    //         this.createPriceLabel(container, config.price, data.position);
    //     });
    // }
    //
    // private createButton(parent: Container, alias: string, position: IPointData, onClick: (pos: IPointData) => void) {
    //     const btn = this.spriteService.createSprite(alias);
    //     btn.position.copyFrom(position);
    //     btn.scale.set(GameConstants.UI_ELEMENT_SCALE);
    //     btn.eventMode = "static";
    //     btn.cursor = "pointer";
    //
    //     btn.on("pointerdown", () => {
    //         btn.once("pointerup", (event) => {
    //             event.stopPropagation();
    //             this.soundService.play(AssetsConstants.SOUND_CLICK);
    //             onClick(event.global);
    //         });
    //     });
    //
    //     parent.addChild(btn);
    // }
    //
    // private createPriceLabel(container: Container, price: number, position: IPointData) {
    //     const style = new TextStyle(FontStyles.TOWER_PRICE_FONT_STYLE);
    //     const priceText = new Text(`${price}`, style);
    //     const offsetTop = 70;
    //
    //     priceText.anchor.set(0.5, 0);
    //     priceText.position.set(position.x, position.y + offsetTop);
    //     container.addChild(priceText);
    // }
    //
    // private createBalanceDisplay() {
    //     const balanceContainer = new Container();
    //
    //     this.balanceText = this.bitmapTextService.createText(
    //         `Balance: ${this.economyService.getBalance()}`,
    //         {fontSize: 50}
    //     );
    //
    //     balanceContainer.x = 20;
    //     balanceContainer.y = 20;
    //
    //     balanceContainer.addChild(this.balanceText);
    //     this.uiLayer.addChild(balanceContainer);
    // }
}