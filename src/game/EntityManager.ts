import { type Container, type IPointData, utils } from "pixi.js";
import { AnimatedSpriteService } from "../services/AnimatedSpriteService";
import { AssetsConstants } from "../constants/AssetsConstants";
import { AnimationConstants } from "../constants/AnimationConstants";
import { type SpriteService } from "../services/SpriteService";
import { PathfindingService } from "../core/pathfinding/PathfindingService";
import { MapConfig } from "../configs/MapConfig";
import { Enemy } from "./entities/Enemy";
import type { TEnemyConfig } from "./entities/EnemyTypes";
import { ObjectPool } from "../core/pool/ObjectPool";

export type TFlameConfig = {
    position: IPointData,
    scale: number,
    width: number,
    animationSpeed: number
}

// TODO: delete debug code
export class EntityManager extends utils.EventEmitter {
    private readonly gameContainer: Container;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private pathfindingService: PathfindingService;
    private enemies: Enemy[] = [];
    private occupiedNodes: Set<string> = new Set();
    private readonly onEnemyReachedFinish: (damage: number) => void;
    private enemyPool: ObjectPool<Enemy>;

    constructor(
        gameContainer: Container,
        animatedSpriteService: AnimatedSpriteService,
        onEnemyReachedFinish: (damage: number) => void
    ) {
        super();
        this.gameContainer = gameContainer;
        this.animatedSpriteService = animatedSpriteService;
        this.onEnemyReachedFinish = onEnemyReachedFinish;
        this.pathfindingService = new PathfindingService(MapConfig.getNodes(), MapConfig.getEdges());
        this.enemyPool = new ObjectPool<Enemy>(() => new Enemy());
    }

    public getEnemies() {
        return this.enemies;
    }

    public registerObstacle(nodeId: string) {
        this.occupiedNodes.add(nodeId);
        this.pathfindingService.setNodeBlocked(nodeId, true);
        this.recalculatePathsForEnemies();
    }

    public getOccupiedNodes() {
        return this.occupiedNodes;
    }

    public addFlame(config: TFlameConfig) {
        const flameAnim = this.animatedSpriteService.createAnimation(
            AssetsConstants.FLAME_ANIM_ALIAS, AnimationConstants.FLAME
        );

        flameAnim.position.set(config.position.x, config.position.y);
        flameAnim.scale.set(config.scale);
        flameAnim.width = config.width;
        flameAnim.animationSpeed = config.animationSpeed;

        this.gameContainer.addChild(flameAnim);
    }

    public spawnWaveEnemy(config: TEnemyConfig) {
        const startId = MapConfig.START_NODE_ID;
        const endId = MapConfig.getFinishNodeId();

        const path = this.pathfindingService.findPath(startId, endId);

        const enemy = this.enemyPool.get(
            path,
            config,
            () => {
                this.onEnemyReachedFinish(enemy.damageToPlayer);
                this.removeEnemy(enemy);
            },
            () => {
                this.emit("enemy_killed_at", {
                    position: { x: enemy.x, y: enemy.y },
                    reward: enemy.reward
                });
                this.emit("enemy_killed");
                this.removeEnemy(enemy);
            }
        );

        this.enemies.push(enemy);
        this.gameContainer.addChild(enemy);
    }

    public update(delta: number) {
        this.enemies.forEach((enemy) => {
            enemy.update(delta);
        })
        this.gameContainer.sortChildren();
    }

    private recalculatePathsForEnemies() {
        const endId = MapConfig.getFinishNodeId();

        this.enemies.forEach((enemy) => {
            const nextNodeId = enemy.getCurrentTargetNodeId();

            if (nextNodeId) {
                const newPath = this.pathfindingService.findPath(nextNodeId, endId);
                enemy.updatePath(newPath);
            }
        });
    }

    private removeEnemy(enemy: Enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
            this.gameContainer.removeChild(enemy);
            this.enemyPool.put(enemy);
        }
    }
}