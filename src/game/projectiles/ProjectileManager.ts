import { Container, type IPointData } from "pixi.js";
import { Projectile } from "./Projectile";
import type { Enemy } from "../entities/Enemy";
import type { SpriteService } from "../../services/SpriteService";
import type { TTowerConfig } from "../towers/TowerTypes";

export class ProjectileManager {
    private readonly gameContainer: Container;
    private readonly spriteService: SpriteService;
    private projectiles: Projectile[] = [];

    constructor(gameContainer: Container, spriteService: SpriteService) {
        this.gameContainer = gameContainer;
        this.spriteService = spriteService;
    }

    public createProjectile(
        startPosition: IPointData,
        target: Enemy,
        config: TTowerConfig
    ) {
        const view = this.spriteService.createSprite(config.projectileAlias);
        view.scale.set(0.5);
        const projectile = new Projectile(
            startPosition,
            target,
            config.damage,
            config.projectileSpeed,
            view,
            config.projectileType
        );
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