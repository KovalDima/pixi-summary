import { type Container, type IPointData } from "pixi.js";
import { AnimatedSpriteService } from "../services/AnimatedSpriteService";
import { AssetsConstants } from "../constants/AssetsConstants";
import { AnimationConstants } from "../constants/AnimationConstants";
import { type SpriteService } from "../services/SpriteService";
import { PathfindingService } from "../core/pathfinding/PathfindingService";
import { MapConfig } from "../configs/MapConfig";
import { Enemy } from "./entities/Enemy";

export type TFlameConfig = {
    position: IPointData,
    scale: number,
    width: number,
    animationSpeed: number
}

// TODO: delete debug code
export class EntityManager {
    private readonly gameContainer: Container;
    private readonly animatedSpriteService: AnimatedSpriteService;
    private readonly spriteService: SpriteService;
    private pathfindingService: PathfindingService;
    private enemies: Enemy[] = [];
    private occupiedNodes: Set<string> = new Set();
    public debugMonsters: Enemy[] = [];

    constructor(
        gameContainer: Container,
        animatedSpriteService: AnimatedSpriteService,
        spriteService: SpriteService
    ) {
        this.gameContainer = gameContainer;
        this.animatedSpriteService = animatedSpriteService;
        this.spriteService = spriteService;
        this.pathfindingService = new PathfindingService(MapConfig.getNodes(), MapConfig.getEdges());
    }

    public registerObstacle(nodeId: string) {
        this.occupiedNodes.add(nodeId);
        this.pathfindingService.setNodeBlocked(nodeId, true);
        this.recalculatePathsForEnemies();
    }

    public getOccupiedNodes() {
        return this.occupiedNodes;
    }

    public debugSpawnAllPoints() {
        this.debugMonsters.forEach(m => m.destroy());
        this.debugMonsters = [];

        const nodes = MapConfig.getNodes();

        nodes.forEach((node) => {
            const enemy = new Enemy(this.spriteService, [node], () => {});
            this.enemies.push(enemy);
            this.gameContainer.addChild(enemy);
            this.debugMonsters.push(enemy);
        });

        this.gameContainer.sortChildren();
    }

    public updateDebugMonsterPos(index: number, x: number, y: number) {
        if (this.debugMonsters[index]) {
            this.debugMonsters[index].x = x;
            this.debugMonsters[index].y = y;
            this.debugMonsters[index].zIndex = y;
        }
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

    public spawnEnemy() {
        const startId = MapConfig.START_NODE_ID;
        const endId = MapConfig.getFinishNodeId();

        const path = this.pathfindingService.findPath(startId, endId);
        const enemy = new Enemy(this.spriteService, path, () => {
            this.removeEnemy(enemy);
        });

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
            enemy.destroy();
        }
    }
}