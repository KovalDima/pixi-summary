import { Sprite, Container } from "pixi.js";
import type { TGraphNode } from "../../core/pathfinding/PathfindingTypes";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { SpriteService } from "../../services/SpriteService";
import { DepthCalculator } from "../../utils/DepthCalculator";

export class Enemy extends Container {
    private readonly sprite: Sprite;
    private readonly path: TGraphNode[];
    private currentTargetIndex: number = 0; // ??
    private speed: number = 3;
    private readonly reachedFinishCallback: () => void;

    constructor(spriteService: SpriteService, path: TGraphNode[], onReachedFinish: () => void) {
        super();
        this.path = path;
        this.reachedFinishCallback = onReachedFinish;

        this.sprite = spriteService.createSprite(AssetsConstants.MONSTER_TEXTURE_ALIAS);
        this.sprite.anchor.set(0.5, 0.9);
        this.addChild(this.sprite);

        if (this.path.length > 0) {
            this.position.copyFrom(this.path[0].position);
            this.currentTargetIndex = 1;
        }

        this.updateScaleAndDepth();
    }

    public update(delta: number) {
        if (this.currentTargetIndex >= this.path.length) {
            return;
        }

        const targetNode = this.path[this.currentTargetIndex];
        const targetPosition = targetNode.position;

        const distanceX = targetPosition.x - this.x;
        const distanceY = targetPosition.y - this.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < this.speed * delta) {
            this.x = targetPosition.x;
            this.y = targetPosition.y;
            this.currentTargetIndex++;

            if (this.currentTargetIndex >= this.path.length) {
                this.reachedFinishCallback();
                return;
            }
        } else {
            this.x += (distanceX / distance) * this.speed * delta;
            this.y += (distanceY / distance) * this.speed * delta;
        }

        this.updateScaleAndDepth();
    }

    private updateScaleAndDepth() {
        const scale = DepthCalculator.getTowerScale(this.y); // tower scale ??
        this.scale.set(scale);
        this.zIndex = this.y;
    }
}