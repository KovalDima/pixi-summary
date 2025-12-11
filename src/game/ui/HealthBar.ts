import { Container, Graphics } from "pixi.js";
import { Config } from "../../Config";

export class HealthBar extends Container {
    private readonly graphics: Graphics;
    private readonly maxHp: number;
    private readonly barWidth: number;
    private readonly barHeight: number;

    constructor(maxHp: number, width: number = 60, height: number = 8) {
        super();
        this.maxHp = maxHp;
        this.barWidth = width;
        this.barHeight = height;
        this.graphics = new Graphics();

        this.addChild(this.graphics);
        this.update(this.maxHp);
    }

    public update(currentHp: number) {
        const hpPercent = Math.max(0, currentHp / this.maxHp);

        this.graphics.clear();
        this.graphics.beginFill(Config.colors.Red);
        this.graphics.drawRect(0, 0, this.barWidth, this.barHeight);
        this.graphics.endFill();

        if (hpPercent > 0) {
            this.graphics.beginFill(Config.colors.Green);
            this.graphics.drawRect(0, 0, this.barWidth * hpPercent, this.barHeight);
            this.graphics.endFill();
        }
    }
}