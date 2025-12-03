import { type Container, type IPointData, Sprite } from "pixi.js";
import { AnimatedSpriteService } from "../services/AnimatedSpriteService";
import { AssetsConstants } from "../constants/AssetsConstants";
import { AnimationConstants } from "../constants/AnimationConstants";
import { type SpriteService } from "../services/SpriteService";
import { DepthCalculator } from "../utils/DepthCalculator";
import { type TTowerConfig, TowerType } from "./towers/TowerTypes";
import { type SoundService } from "../services/SoundService";
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
    private readonly soundService: SoundService;
    private pathfindingService: PathfindingService;

    private towers: Sprite[] = [];
    private enemies: Enemy[] = [];
    public debugMonsters: Enemy[] = [];

    constructor(
        gameContainer: Container,
        animatedSpriteService: AnimatedSpriteService,
        spriteService: SpriteService,
        soundService: SoundService
    ) {
        this.gameContainer = gameContainer;
        this.animatedSpriteService = animatedSpriteService;
        this.spriteService = spriteService;
        this.soundService = soundService;
        this.pathfindingService = new PathfindingService(MapConfig.getNodes(), MapConfig.getEdges());
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

    public addTower(config: TTowerConfig, position: IPointData) {
        const towerObject = this.getTower(config);
        const towerScale = DepthCalculator.getTowerScale(position.y);
        const towerZIndex = position.y;

        towerObject.position.set(position.x, position.y);
        towerObject.scale.set(towerScale);
        towerObject.zIndex = towerZIndex;

        this.towers.push(towerObject);
        this.gameContainer.addChild(towerObject);
    }

    public spawnEnemy() {
        const startId = MapConfig.START_NODE_ID;
        const endId = MapConfig.getFinishNodeId();

        const path = this.pathfindingService.findPath(startId, endId);

        if (!path || path.length === 0) {
            console.error("Шлях для монстра не знайдено!");
            return;
        }

        const enemy = new Enemy(this.spriteService, path, () => {
            this.removeEnemy(enemy);
        });

        this.enemies.push(enemy);
        this.gameContainer.addChild(enemy);
    }

    private removeEnemy(enemy: Enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
            enemy.destroy();
        }
    }

    private getTower(config: TTowerConfig) {
        let tower;
        switch (config.type) {
            case TowerType.REGULAR_TOWER:
                tower = this.spriteService.createSprite(config.assetAlias);
                this.soundService.play(AssetsConstants.SOUND_REGULAR_TOWER_BUILD);
                break;

            case TowerType.ARCHER_TOWER:
                if (!config.animationName) {
                    throw new Error(`Missing animationName for tower config: ${config.type}`)
                }
                tower = this.animatedSpriteService.createAnimation(config.assetAlias, config.animationName);
                tower.loop = false;
                tower.animationSpeed = 0.03;
                this.soundService.play(AssetsConstants.SOUND_BUILD_PROCESS);
                break;
        }
        return tower;
    }

    public update(delta: number) {
        for (let i = this.enemies.length - 1; i >= 0; i--) { // from end ?
            this.enemies[i].update(delta);
        }
        this.gameContainer.sortChildren();
    }
}