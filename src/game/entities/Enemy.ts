import { Sprite, Container, type IPointData, Assets } from "pixi.js";
import { PathNodeType, type TPathNode } from "../../core/pathfinding/PathfindingTypes";
import { DepthCalculator } from "../../utils/DepthCalculator";
import { EffectUtils } from "../../utils/EffectUtils";
import { HealthBar } from "../ui/HealthBar";
import type { TEnemyConfig } from "./EnemyTypes";
import type { IPoolable } from "../../core/pool/IPoolable";

export class Enemy extends Container implements IPoolable{
    private readonly sprite: Sprite;
    private readonly healthBar: HealthBar;
    private path: TPathNode[] = [];
    private currentTargetIndex: number = 0;
    private currentTargetPoint: IPointData | null = null;
    private readonly randomOffsetRange = 15;
    private baseSpeed: number = 0;
    private currentSpeed: number = 0;
    private maxHp: number = 0;
    private currentHp: number = 0;
    public reward: number = 0;
    public damageToPlayer: number = 0;
    private scaleMultiplier: number = 1;
    private ignoreSlowdown: boolean = false;
    public active: boolean = false;

    private reachedFinishCallback: (() => void) | null = null;
    private killedCallback: (() => void) | null = null;

    constructor() {
        super();
        this.sprite = new Sprite();
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        // TODO: not every enemy has a healthBar
        const barWidth = 140;
        const barHeight = 14;
        this.healthBar = new HealthBar(100, barWidth, barHeight);
        this.healthBar.position.set(-barWidth / 2, -barWidth / 1.5);
        this.addChild(this.healthBar);
    }

    public reset(
        path: TPathNode[],
        config: TEnemyConfig,
        onReachedFinish: () => void,
        onKilled: () => void
    ) {
        this.active = true;
        this.path = path;
        this.maxHp = config.hp;
        this.currentHp = this.maxHp;
        this.baseSpeed = config.speed;
        this.currentSpeed = this.baseSpeed;
        this.reward = config.reward;
        this.damageToPlayer = config.damageToPlayer;
        this.scaleMultiplier = config.scaleMultiplier;
        this.ignoreSlowdown = config.ignoreSlowdown;

        this.reachedFinishCallback = onReachedFinish;
        this.killedCallback = onKilled;

        const texture = Assets.get(config.textureAlias);

        if (texture) {
            this.sprite.texture = texture;
        }

        this.healthBar.visible = config.showHealthBar;

        if (config.showHealthBar) {
            this.healthBar.reset(this.maxHp);
        }

        this.sprite.tint = 0xFFFFFF;
        this.alpha = 1;

        if (this.path.length > 0) {
            this.position.copyFrom(this.path[0].position);
            this.currentTargetIndex = 1;
            this.setNextTargetPoint();
        }

        this.updateScaleAndDepth();
    }

    public clean() {
        this.active = false;
        this.reachedFinishCallback = null;
        this.killedCallback = null;
        this.path = [];
    }

    public getCurrentTargetNodeId() {
        if (this.path && this.currentTargetIndex < this.path.length) {
            return this.path[this.currentTargetIndex].id;
        }
        return null;
    }

    public updatePath(newPath: TPathNode[]) {
        this.path = newPath;
        this.currentTargetIndex = 0;
        this.setNextTargetPoint();
    }

    public update(delta: number) {
        if (!this.active || !this.currentTargetPoint) {
            return;
        }

        const targetNode = this.path[this.currentTargetIndex];

        if (targetNode.type === PathNodeType.DETOUR && !this.ignoreSlowdown) {
            this.currentSpeed = this.baseSpeed * 0.3;
        } else {
            this.currentSpeed = this.baseSpeed;
        }

        const targetPosition = this.currentTargetPoint;
        // TODO: reuse
        const distanceX = targetPosition.x - this.x;
        const distanceY = targetPosition.y - this.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        const normalizedSpeed = this.currentSpeed * delta;

        if (distance < normalizedSpeed) {
            this.x = targetPosition.x;
            this.y = targetPosition.y;
            this.currentTargetIndex++;

            if (this.currentTargetIndex >= this.path.length) {
                this.reachedFinishCallback?.();
                return;
            }

            this.setNextTargetPoint();
        } else {
            this.x += (distanceX / distance) * normalizedSpeed;
            this.y += (distanceY / distance) * normalizedSpeed;
        }

        this.updateScaleAndDepth();
    }

    public takeDamage(amount: number) {
        if (this.currentHp <= 0) {
            return;
        }

        this.currentHp -= amount;
        EffectUtils.blinkRed(this.sprite);
        this.healthBar?.update(this.currentHp);

        if (this.currentHp <= 0) {
            this.killedCallback?.();
        }
    }

    private setNextTargetPoint() {
        const node = this.path[this.currentTargetIndex];
        const randomOffset = (Math.random() - 0.5) * 2 * this.randomOffsetRange;

        this.currentTargetPoint = {
            x: node.position.x + randomOffset,
            y: node.position.y + randomOffset
        };
    }

    private updateScaleAndDepth() {
        // TODO:
        //  getTowerScale rename to "somethingScale"
        const scale = DepthCalculator.getTowerScale(this.y) * this.scaleMultiplier;
        this.scale.set(scale);
        this.zIndex = this.y;
    }
}