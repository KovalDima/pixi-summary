import { Container, Graphics, type IPointData } from "pixi.js";
import type { Enemy } from "../entities/Enemy";

export class Projectile extends Container {
    private readonly target: Enemy;
    private readonly speed: number;
    private readonly damage: number;
    private readonly graphics: Graphics;

    constructor(
        startPosition: IPointData,
        target: Enemy,
        damage: number,
        speed: number
    ) {
        super();
        this.position.copyFrom(startPosition);
        this.target = target;
        this.damage = damage;
        this.speed = speed;

        // TODO: temporary graphics projectile - replace texture
        this.graphics = new Graphics();
        this.graphics.beginFill(0xFFFF00);
        this.graphics.drawCircle(0, 0, 5);
        this.graphics.endFill();
        this.addChild(this.graphics);
    }

    // TODO: rename method?
    public update(delta: number) {
        if (this.target.destroyed) {
            this.destroy();
            return true;
        }

        // TODO: can I reuse it?
        const distanceX = this.target.x - this.x;
        const distanceY = this.target.y - this.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < 10 + (this.speed * delta)) {
            this.hitTarget();
            return true;
        }

        const angle = Math.atan2(distanceY, distanceX);
        this.x += Math.cos(angle) * this.speed * delta;
        this.y += Math.sin(angle) * this.speed * delta;

        return false;
    }

    private hitTarget() {
        if (!this.target.destroyed) {
            this.target.takeDamage(this.damage);
        }
        this.destroy();
    }
}