import { Container, Sprite, type IPointData } from "pixi.js";
import type { Enemy } from "../entities/Enemy";

export class Projectile extends Container {
    private readonly target: Enemy;
    private readonly speed: number;
    private readonly damage: number;
    private readonly view: Sprite;
    private readonly type: "linear" | "arc";
    private readonly startPosition: IPointData;
    private readonly initialDistance: number;
    private readonly ARC_HEIGHT = 80;
    private readonly ROTATION_SPEED = 0.2;
    private readonly PARABOLA_COEFF = 4;
    private readonly MAX_PROGRESS = 1;

    constructor(
        startPosition: IPointData,
        target: Enemy,
        damage: number,
        speed: number,
        view: Sprite,
        type: "linear" | "arc"
    ) {
        super();
        this.position.copyFrom(startPosition);
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.view = view;
        this.type = type;
        this.startPosition = { x: startPosition.x, y: startPosition.y };

        this.addChild(this.view);

        // TODO: reuse it
        const distanceX = this.target.x - this.startPosition.x;
        const distanceY = this.target.y - this.startPosition.y;
        this.initialDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    }

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
        const moveStep = this.speed * delta;

        this.x += Math.cos(angle) * moveStep;
        this.y += Math.sin(angle) * moveStep;

        if (this.type === "linear") {
            this.view.rotation = angle;
        } else if (this.type === "arc") {
            let progress = this.MAX_PROGRESS - (distance / this.initialDistance);
            progress = Math.max(0, Math.min(this.MAX_PROGRESS, progress));
            const heightOffset = this.PARABOLA_COEFF * this.ARC_HEIGHT * progress * (this.MAX_PROGRESS - progress);
            this.view.y = -heightOffset;
            this.view.rotation += this.ROTATION_SPEED * delta;
        }

        return false;
    }

    private hitTarget() {
        if (!this.target.destroyed) {
            this.target.takeDamage(this.damage);
        }
        this.destroy();
    }
}