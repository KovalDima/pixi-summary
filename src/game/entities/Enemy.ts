import { Sprite, Container } from "pixi.js";
import { PathNodeType, type TPathNode } from "../../core/pathfinding/PathfindingTypes";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";
import { DepthCalculator } from "../../utils/DepthCalculator";

export class Enemy extends Container {
    private readonly sprite: Sprite;
    private readonly path: TPathNode[];
    private currentTargetIndex: number = 0;
    private readonly baseSpeed: number = 2;
    private currentSpeed: number = this.baseSpeed;
    private readonly reachedFinishCallback: () => void;

    constructor(spriteService: SpriteService, path: TPathNode[], onReachedFinish: () => void) {
        super();
        this.path = path;
        this.reachedFinishCallback = onReachedFinish;

        this.sprite = spriteService.createSprite(AssetsConstants.MONSTER_TEXTURE_ALIAS);
        this.addChild(this.sprite);

        if (this.path.length > 0) {
            this.position.copyFrom(this.path[0].position);
            this.currentTargetIndex = 1;
        }

        this.updateScaleAndDepth();
    }

    public update(delta: number) {
        // TODO: only for debug?
        if (this.currentTargetIndex >= this.path.length) {
            return;
        }

        const targetNode = this.path[this.currentTargetIndex];

        if (targetNode.type === PathNodeType.DETOUR) {
            this.currentSpeed = this.baseSpeed * 0.4;
        } else {
            this.currentSpeed = this.baseSpeed;
        }

        const targetPosition = targetNode.position;
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
        } else {
            this.x += (distanceX / distance) * normalizedSpeed;
            this.y += (distanceY / distance) * normalizedSpeed;
        }

        this.updateScaleAndDepth();
    }

    private updateScaleAndDepth() {
        // TODO:
        //  getTowerScale rename to "somethingScale"
        const scale = DepthCalculator.getTowerScale(this.y);
        this.scale.set(scale);
        this.zIndex = this.y;
    }
}