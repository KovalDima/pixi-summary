import { Container, type IPointData } from "pixi.js";
import { SpriteService } from "../../services/SpriteService";
import { ParticleService } from "../../services/ParticleService";
import { Coin } from "./Coin";
import gsap from "gsap";

export class DropManager {
    private readonly gameContainer: Container;
    private readonly uiContainer: Container;
    private readonly spriteService: SpriteService;
    private readonly particleService: ParticleService;
    private readonly getTargetPosition: () => IPointData;

    constructor(
        gameContainer: Container,
        uiContainer: Container,
        spriteService: SpriteService,
        particleService: ParticleService,
        getTargetPosition: () => IPointData
    ) {
        this.gameContainer = gameContainer;
        this.uiContainer = uiContainer;
        this.spriteService = spriteService;
        this.particleService = particleService;
        this.getTargetPosition = getTargetPosition;
    }

    public spawnCoin(position: IPointData, onComplete: () => void) {
        const coin = new Coin(this.spriteService);

        coin.position.copyFrom(position);
        coin.zIndex = position.y + 1;
        this.gameContainer.addChild(coin);
        this.gameContainer.sortChildren();

        const dropOffset = {
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 30
        };
        const landPosition = {
            x: coin.x + dropOffset.x,
            y: coin.y + dropOffset.y
        };

        const jumpDuration = 0.5;

        gsap.to(coin, {
            x: landPosition.x,
            y: landPosition.y,
            duration: jumpDuration,
            ease: "power1.out",
        });

        gsap.to(coin.children[0], {
            y: -50,
            duration: jumpDuration / 2,
            yoyo: true,
            repeat: 1,
            ease: "sine.out",
            onComplete: () => {
                gsap.delayedCall(1.0, () => {
                    this.flyToWallet(coin, onComplete);
                });
            }
        });
    }

    private flyToWallet(coin: Coin, onComplete: () => void) {
        const globalPos = coin.getGlobalPosition();
        const localUiPos = this.uiContainer.toLocal(globalPos);
        const targetGlobalPos = this.getTargetPosition();
        const targetLocalPos = this.uiContainer.toLocal(targetGlobalPos);

        this.uiContainer.addChild(coin);
        coin.position.copyFrom(localUiPos);
        coin.scale.set(1);

        const emitter = this.particleService.createSparkEmitter(this.uiContainer);
        emitter.emit = true;

        gsap.to(coin, {
            x: targetLocalPos.x,
            y: targetLocalPos.y,
            duration: 1,
            ease: "back.in(1.2)",
            onUpdate: () => {
                emitter.updateOwnerPos(coin.x, coin.y);
            },
            onComplete: () => {
                const removeEmitterDelay = 1000;

                emitter.emit = false;
                setTimeout(() => this.particleService.removeEmitter(emitter), removeEmitterDelay);
                coin.destroy();
                onComplete();
            }
        });
    }
}