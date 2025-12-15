import { Container, Sprite, type BitmapText } from "pixi.js";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";
import { BitmapTextService } from "../../services/BitmapTextService";
import { Config } from "../../Config";

export class ItemsPanel extends Container {
    private readonly background: Sprite;
    private readonly itemsContainer: Container;
    private readonly labelText: BitmapText;

    constructor(spriteService: SpriteService, label: string, bitmapTextService: BitmapTextService) {
        super();
        this.background = spriteService.createSprite(AssetsConstants.UI_ITEMS_PANEL_ALIAS);
        this.background.anchor.set(0.5);
        this.addChild(this.background);

        this.labelText = bitmapTextService.createText(label, {
            fontSize: 30,
            tint: Config.colors.Brown
        });

        this.labelText.anchor.set(0.5);
        this.labelText.position.set(0, -57);
        this.addChild(this.labelText);
        this.itemsContainer = new Container();
        this.addChild(this.itemsContainer);
    }

    public addItem(item: Container) {
        this.itemsContainer.addChild(item);
        this.updateLayout();
    }

    private updateLayout() {
        const gap = 20;
        const children = this.itemsContainer.children as Container[];
        const slotsCount = this.itemsContainer.children.length;

        if (slotsCount === 0) {
            return;
        }

        const contentWidth = children.reduce((sum, child) => sum + child.width, 0);
        const totalWidth = contentWidth + (Math.max(0, slotsCount - 1) * gap);

        let currentX = -totalWidth / 2;
        const slotsY = 40;

        children.forEach((child) => {
            const childW = child.width;
            child.position.set(currentX + childW / 2, slotsY);
            currentX += childW + gap;
        });
    }

    public get width() {
        return this.background.width;
    }

    public get height() {
        return this.background.height;
    }
}