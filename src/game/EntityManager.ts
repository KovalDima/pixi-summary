import { type Container, utils } from "pixi.js";
import { PathfindingService } from "../core/pathfinding/PathfindingService";
import { MapConfig } from "../configs/MapConfig";
import { Enemy } from "./entities/Enemy";
import type { TEnemyConfig } from "./entities/EnemyTypes";
import { ObjectPool } from "../core/pool/ObjectPool";

// TODO: delete debug code
export class EntityManager extends utils.EventEmitter {
    private readonly gameContainer: Container;
    private pathfindingService: PathfindingService;
    private enemies: Enemy[] = [];
    private occupiedNodes: Set<string> = new Set();
    private readonly onEnemyReachedFinish: (damage: number) => void;
    private enemyPool: ObjectPool<Enemy>;

    constructor(
        gameContainer: Container,
        onEnemyReachedFinish: (damage: number) => void
    ) {
        super();
        this.gameContainer = gameContainer;
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