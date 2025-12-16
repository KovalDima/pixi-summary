import { Container, type IPointData, Assets } from "pixi.js";
import { Projectile } from "./Projectile";
import type { Enemy } from "../entities/Enemy";
import type { TTowerConfig } from "../towers/TowerTypes";
import { ObjectPool } from "../../core/pool/ObjectPool";

export class ProjectileManager {
    private readonly gameContainer: Container;
    private projectiles: Projectile[] = [];
    private projectilePool: ObjectPool<Projectile>;

    constructor(gameContainer: Container) {
        this.gameContainer = gameContainer;
        this.projectilePool = new ObjectPool<Projectile>(() => {
            return new Projectile();
        });
    }

    public createProjectile(
        startPosition: IPointData,
        target: Enemy,
        config: TTowerConfig
    ) {
        const texture = Assets.get(config.projectileAlias);

        if (!texture) {
            throw new Error(`Texture not found for projectile: ${config.projectileAlias}`);
        }

        const projectile = this.projectilePool.get(
            startPosition,
            target,
            config.damage,
            config.projectileSpeed,
            texture,
            config.projectileType
        );

        projectile.scale.set(0.5);
        this.projectiles.push(projectile);
        this.gameContainer.addChild(projectile);
    }

    public update(delta: number) {
        this.projectiles.forEach((projectile, index) => {
            const isFinished = projectile.update(delta);

            if (isFinished) {
                this.gameContainer.removeChild(projectile);
                this.projectilePool.put(projectile);
                this.projectiles.splice(index, 1);
            }
        });
    }
}