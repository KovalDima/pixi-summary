import { Container, Sprite, AnimatedSprite } from "pixi.js";
import type { TTowerConfig } from "./TowerTypes";
import type { Enemy } from "../entities/Enemy";
import type { ProjectileManager } from "../projectiles/ProjectileManager";

export class Tower extends Container {
    private readonly config: TTowerConfig;
    private readonly projectileManager: ProjectileManager;
    private readonly view: Sprite | Container;
    private cooldownTimer: number = 0;
    private isBuilding: boolean = false;

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

        if (this.view instanceof AnimatedSprite) {
            this.isBuilding = true;
            this.view.onComplete = () => {
                this.isBuilding = false;
            };
        }
    }

    public update(delta: number, enemies: Enemy[]) {
        if (this.isBuilding) {
            return;
        }

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
        let furthestEnemy: Enemy | null = null;
        let maxDistance = 0;

        for (const enemy of enemies) {
            if (enemy.destroyed) {
                continue;
            }

            // TODO: reuse?
            const distanceX = enemy.x - this.x;
            const distanceY = enemy.y - this.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance <= this.config.range) {
                if (distance > maxDistance) {
                    maxDistance = distance;
                    furthestEnemy = enemy;
                }
            }
        }

        return furthestEnemy;
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
            this.config
        );

        // TODO: shoot sound here
    }
}