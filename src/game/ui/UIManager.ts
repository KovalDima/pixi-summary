import { Container, BitmapText, Text, TextStyle, type IPointData } from "pixi.js";
import { GameConstants } from "../../constants/GameConstants";
import { FontStyles } from "../../constants/FontStyles";
import { TowerRegistry } from "../towers/TowerRegistry";
import type { EconomyService } from "../../services/EconomyService";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { ObjectPlacementController, PlaceableItemType } from "../placement/ObjectPlacementController";
import { SpriteService } from "../../services/SpriteService";
import type { SoundService } from "../../services/SoundService";
import { BoosterRegistry } from "../boosters/BoosterRegistry";
import type { BitmapTextService } from "../../services/BitmapTextService";

export class UIManager {
    private readonly uiLayer: Container;
    private readonly economyService: EconomyService;
    private balanceText: BitmapText | null = null;
    private placementController: ObjectPlacementController;
    private spriteService: SpriteService;
    private soundService: SoundService;
    private bitmapTextService: BitmapTextService;

    constructor(
        uiLayer: Container,
        economyService: EconomyService,
        placementController: ObjectPlacementController,
        spriteService: SpriteService,
        soundService: SoundService,
        bitmapTextService: BitmapTextService
    ) {
        this.uiLayer = uiLayer;
        this.economyService = economyService;
        this.placementController = placementController;
        this.spriteService = spriteService;
        this.soundService = soundService;
        this.bitmapTextService = bitmapTextService;
    }

    public init(gameContainer: Container) {
        this.createBalanceDisplay();
        this.createTowerButtons(gameContainer);
        this.createBoosterButtons(gameContainer);
    }

    // TODO
    private createTowerButtons(container: Container) {
        GameConstants.TOWER_BUTTON_POSITIONS.forEach((data) => {
            const config = TowerRegistry.getData(data.type);

            if (!config) {
                return;
            }

            this.createButton(
                container,
                config.iconAlias,
                data.position,
                (globalPos) => {
                    this.placementController.startPlacing({
                        type: PlaceableItemType.TOWER,
                        config: config,
                        iconAlias: config.iconAlias
                    }, globalPos);
                }
            );

            this.createPriceLabel(container, config.price, data.position);
        });
    }

    // TODO
    private createBoosterButtons(container: Container) {
        GameConstants.BOOSTER_BUTTON_POSITIONS.forEach((data) => {
            const config = BoosterRegistry.getData(data.type);

            if (!config) {
                return;
            }

            this.createButton(
                container,
                config.iconAlias,
                data.position,
                (globalPos) => {
                    this.placementController.startPlacing({
                        type: PlaceableItemType.BOOSTER,
                        config: config,
                        iconAlias: config.iconAlias
                    }, globalPos);
                }
            );

            this.createPriceLabel(container, config.price, data.position);
        });
    }

    private createButton(parent: Container, alias: string, position: IPointData, onClick: (pos: IPointData) => void) {
        const btn = this.spriteService.createSprite(alias);
        btn.position.copyFrom(position);
        // TODO:
        //  make similar real sizes for towers and boosters (spritesheet)
        btn.scale.set(GameConstants.UI_ELEMENT_SCALE);
        btn.eventMode = "static";
        btn.cursor = "pointer";

        btn.on("pointerdown", () => {
            btn.once("pointerup", (event) => {
                event.stopPropagation();
                this.soundService.play(AssetsConstants.SOUND_CLICK);
                onClick(event.global);
            });
        });

        parent.addChild(btn);
    }

    private createPriceLabel(container: Container, price: number, position: IPointData) {
        const style = new TextStyle(FontStyles.TOWER_PRICE_FONT_STYLE);
        const priceText = new Text(`${price}`, style);
        const offsetTop = 70;

        priceText.anchor.set(0.5, 0);
        priceText.position.set(position.x, position.y + offsetTop);
        container.addChild(priceText);
    }

    private createBalanceDisplay() {
        const balanceContainer = new Container();

        this.balanceText = this.bitmapTextService.createText(
            `Balance: ${this.economyService.getBalance()}`,
            {fontSize: 50}
        );

        balanceContainer.x = 20;
        balanceContainer.y = 20;

        balanceContainer.addChild(this.balanceText);
        this.uiLayer.addChild(balanceContainer);
    }
}