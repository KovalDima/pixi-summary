import { Sprite, Container, type IPointData } from "pixi.js";
import { PathNodeType, type TPathNode } from "../../core/pathfinding/PathfindingTypes";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";
import { DepthCalculator } from "../../utils/DepthCalculator";
import { Config } from "../../Config";
import { EffectUtils } from "../../utils/EffectUtils";

export class Enemy extends Container {
    private readonly sprite: Sprite;
    private path: TPathNode[];
    private currentTargetIndex: number = 0;
    private currentTargetPoint: IPointData | null = null;
    private readonly randomOffsetRange = 15;
    private readonly baseSpeed: number = 2;
    private currentSpeed: number = this.baseSpeed;
    private readonly reachedFinishCallback: () => void;
    private readonly killedCallback: () => void;
    private maxHp: number = 50;
    private currentHp: number;
    public reward: number = 10;
    public damageToPlayer: number = 1;

    constructor(
        spriteService: SpriteService,
        path: TPathNode[],
        onReachedFinish: () => void,
        onKilled: () => void
    ) {
        super();
        this.path = path;
        this.reachedFinishCallback = onReachedFinish;
        this.killedCallback = onKilled;
        this.currentHp = this.maxHp;

        this.sprite = spriteService.createSprite(AssetsConstants.MONSTER_TEXTURE_ALIAS);
        this.addChild(this.sprite);

        if (this.path.length > 0) {
            this.position.copyFrom(this.path[0].position);
            this.currentTargetIndex = 1;
            this.setNextTargetPoint();
        }

        this.updateScaleAndDepth();
        // this.drawHealthBar(); ??
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
        if (!this.currentTargetPoint) {
            return;
        }

        const targetNode = this.path[this.currentTargetIndex];

        if (targetNode.type === PathNodeType.DETOUR) {
            this.currentSpeed = this.baseSpeed * 0.4;
        } else {
            this.currentSpeed = this.baseSpeed;
        }

        const targetPosition = this.currentTargetPoint;
        const distanceX = targetPosition.x - this.x;
        const distanceY = targetPosition.y - this.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        const normalizedSpeed = this.currentSpeed * delta;

        if (distance < normalizedSpeed) {
            this.x = targetPosition.x;
            this.y = targetPosition.y;
            this.currentTargetIndex++;

            if (this.currentTargetIndex >= this.path.length) {
                this.reachedFinishCallback();
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

        if (this.currentHp <= 0) {
            this.die();
        }
    }

    private die() {
        this.killedCallback();
        // death/coin animation ??
        this.destroy();
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
        const scale = DepthCalculator.getTowerScale(this.y);
        this.scale.set(scale);
        this.zIndex = this.y;
    }
}