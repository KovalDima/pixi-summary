import { Container, type IPointData } from "pixi.js";
import { Projectile } from "./Projectile";
import type { Enemy } from "../entities/Enemy";

export class ProjectileManager {
    private readonly gameContainer: Container;
    private projectiles: Projectile[] = [];

    constructor(gameContainer: Container) {
        this.gameContainer = gameContainer;
    }

    public createProjectile(
        startPosition: IPointData,
        target: Enemy,
        damage: number,
        speed: number
    ) {
        const projectile = new Projectile(startPosition, target, damage, speed);
        this.projectiles.push(projectile);
        this.gameContainer.addChild(projectile);
    }

    public update(delta: number) {
        this.projectiles.forEach((projectile, index) => {
            const isFinished = projectile.update(delta);
            if (isFinished) {
                this.projectiles.splice(index, 1);
            }
        });
    }
}