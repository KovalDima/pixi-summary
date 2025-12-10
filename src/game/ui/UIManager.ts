import { Container, BitmapText, BitmapFont, Text, TextStyle } from "pixi.js";
import { GameConstants } from "../../constants/GameConstants";
import { FontConstants } from "../../constants/FontConstants";
import { FontStyles } from "../../constants/FontStyles";
import { TowerRegistry } from "../towers/TowerRegistry";
import type { EconomyService } from "../../services/EconomyService";

export class UIManager {
    private readonly uiLayer: Container;
    private readonly economyService: EconomyService;
    private balanceText: BitmapText | null = null;

    constructor(uiLayer: Container, economyService: EconomyService) {
        this.uiLayer = uiLayer;
        this.economyService = economyService;
    }

    public init(gameContainer: Container) {
        this.initBitmapFont();
        this.createBalanceDisplay();
        this.createTowerPriceLabels(gameContainer);
    }

    private initBitmapFont() {
        BitmapFont.from(FontConstants.BITMAP_VCR_FONT.fontName, FontConstants.BITMAP_VCR_FONT);
    }

    private createBalanceDisplay() {
        const balanceContainer = new Container();

        this.balanceText = new BitmapText(`Balance: ${this.economyService.getBalance()}`, {
            fontName: FontConstants.BITMAP_VCR_FONT.fontName
        });

        balanceContainer.x = 20;
        balanceContainer.y = 20;

        balanceContainer.addChild(this.balanceText);
        this.uiLayer.addChild(balanceContainer);
    }

    private createTowerPriceLabels(gameContainer: Container) {
        const style = new TextStyle(FontStyles.TOWER_PRICE_FONT_STYLE);

        GameConstants.TOWER_BUTTON_POSITIONS.forEach((data) => {
            const towerConfig = TowerRegistry.getTowerData(data.type);

            if (!towerConfig) {
                return;
            }

            const priceText = new Text(`${towerConfig.price}`, style);
            const offsetTop = 70;

            priceText.anchor.set(0.5, 0);
            priceText.position.set(data.position.x, data.position.y + offsetTop);
            gameContainer.addChild(priceText);
        });
    }
}