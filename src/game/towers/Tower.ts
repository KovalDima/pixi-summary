import { Container, Sprite } from "pixi.js";
import type { TTowerConfig } from "./TowerTypes";
import type { Enemy } from "../entities/Enemy";
import type { ProjectileManager } from "../projectiles/ProjectileManager";

export class Tower extends Container {
    private readonly config: TTowerConfig;
    private readonly projectileManager: ProjectileManager;
    private readonly view: Sprite | Container;
    private cooldownTimer: number = 0;

    constructor(
        config: TTowerConfig,
        view: Sprite | Container,
        projectileManager: ProjectileManager
    ) {
        super();
        this.config = config;
        this.view = view;
        this.projectileManager = projectileManager;
        this.addChild(this.view);
    }

    public update(delta: number, enemies: Enemy[]) {
        const deltaMS = delta * 16.66;

        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= deltaMS;
        }

        if (this.cooldownTimer <= 0) {
            const target = this.findTarget(enemies);
            if (target) {
                this.fire(target);
                this.cooldownTimer = this.config.fireRate;
            }
        }
    }

    private findTarget(enemies: Enemy[]) {
        let closestEnemy: Enemy | null = null;
        let minDistance = this.config.range;

        for (const enemy of enemies) {
            if (enemy.destroyed) {
                continue;
            }

            // TODO: reuse?
            const distanceX = enemy.x - this.x;
            const distanceY = enemy.y - this.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance <= minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        }

        return closestEnemy;
    }

    private fire(target: Enemy) {
        const yOffset = 40;
        const spawnPosition = {
            x: this.x,
            y: this.y - yOffset,
        };

        this.projectileManager.createProjectile(
            spawnPosition,
            target,
            this.config.damage,
            this.config.projectileSpeed
        );

        // TODO: shoot sound here
    }
}