import { Container, Sprite, Texture, type IPointData } from "pixi.js";
import type { Enemy } from "../entities/Enemy";
import type { IPoolable } from "../../core/pool/IPoolable";

export class Projectile extends Container implements IPoolable {
    private target: Enemy | null = null;
    private speed = 0;
    private damage = 0;
    private readonly view: Sprite;
    private type: "linear" | "arc" = "linear";
    private startPosition: IPointData = { x: 0, y: 0 };
    private initialDistance = 0;
    private readonly ARC_HEIGHT = 80;
    private readonly ROTATION_SPEED = 0.2;
    private readonly PARABOLA_COEFF = 4;
    private readonly MAX_PROGRESS = 1;

    constructor() {
        super();
        this.view = new Sprite();
        this.view.anchor.set(0.5);
        this.addChild(this.view);
    }

    public reset(
        startPosition: IPointData,
        target: Enemy,
        damage: number,
        speed: number,
        texture: Texture,
        type: "linear" | "arc"
    ) {
        this.position.copyFrom(startPosition);
        this.startPosition = { x: startPosition.x, y: startPosition.y };
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.type = type;
        this.view.texture = texture;
        this.view.rotation = 0;
        this.view.y = 0;

        // TODO: reuse it
        const distanceX = this.target.x - this.startPosition.x;
        const distanceY = this.target.y - this.startPosition.y;
        this.initialDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    }

    public clean() {
        this.target = null;
    }

    public update(delta: number) {
        if (!this.target || this.target.destroyed) {
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
        if (this.target && !this.target.destroyed) {
            this.target.takeDamage(this.damage);
        }
    }
}