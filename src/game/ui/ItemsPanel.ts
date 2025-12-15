import { Container, Sprite } from "pixi.js";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";
import {BitmapTextService} from "../../services/BitmapTextService";

export class ItemsPanel extends Container {
    private readonly background: Sprite;
    private readonly itemsContainer: Container;

    constructor(spriteService: SpriteService, label: string, bitmapTextService: BitmapTextService,) {
        super();
        this.background = spriteService.createSprite(AssetsConstants.UI_ITEMS_PANEL_ALIAS);
        this.background.anchor.set(0.5);
        this.addChild(this.background);

        // 2. Контейнер для слотів, щоб їх центрувати разом
        this.itemsContainer = new Container();
        this.addChild(this.itemsContainer);

        // TODO: Якщо потрібно додати заголовок панелі (наприклад "Вежі"),
        // можна додати сюди BitmapText, переданий в конструктор.
    }

    public addItem(item: Container) {
        this.itemsContainer.addChild(item);
        this.updateLayout();
    }

    private updateLayout() {
        const gap = 15;
        let startX = 0;

        const totalWidth = this.itemsContainer.children.reduce((acc, child, index) => {
            // @ts-ignore
            return acc + (child.width || 0) + (index > 0 ? gap : 0);
        }, 0);

        startX = -totalWidth / 2;

        let currentX = startX;
        this.itemsContainer.children.forEach((child: any) => {
            // Враховуємо, що у child anchor.x = 0.5
            const halfWidth = child.width / 2;
            child.position.set(currentX + halfWidth, 55);
            currentX += child.width + gap;
        });
    }

    public get width() {
        return this.background.width;
    }

    public get height() {
        return this.background.height;
    }
}