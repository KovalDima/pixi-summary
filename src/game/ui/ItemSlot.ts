import { Container, Sprite } from "pixi.js";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";
import { BitmapTextService } from "../../services/BitmapTextService";
import { GameConstants } from "../../constants/GameConstants";
import { Config } from "../../Config";

export type TItemSlotConfig = {
    iconAlias: string,
    price: number,
}

export class ItemSlot extends Container {
    private readonly background: Sprite;
    private readonly icon: Sprite;
    private readonly price: Container;

    constructor(
        spriteService: SpriteService,
        bitmapTextService: BitmapTextService,
        config: TItemSlotConfig,
        onClick: () => void
    ) {
        super();
        this.background = spriteService.createSprite(AssetsConstants.UI_ITEM_SLOT_ALIAS);
        this.background.anchor.set(0.5);
        this.addChild(this.background);

        this.icon = spriteService.createSprite(config.iconAlias);
        this.icon.scale.set(GameConstants.UI_ELEMENT_SCALE);
        this.icon.anchor.set(0.5);
        this.addChild(this.icon);

        this.price = bitmapTextService.createText(`${config.price}`, {
            fontSize: 24,
            tint: Config.colors.White
        });
        this.price.position.set(0, 35);
        this.addChild(this.price);

        this.eventMode = "static";
        this.cursor = "pointer";
        this.on("pointerdown", () => {
            onClick();
        });
    }
}