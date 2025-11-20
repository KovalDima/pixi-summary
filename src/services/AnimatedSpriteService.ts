import { Assets, AnimatedSprite } from "pixi.js";

export class AnimatedSpriteService {
    public createAnimation(spritesheetAlias: string, animationName: string) {
        const spritesheet = Assets.get(spritesheetAlias);
        if (!spritesheet) {
            throw new Error(`Spritesheet not found: ${spritesheetAlias}`);
        }

        const textures = spritesheet.animations[animationName];
        if (!textures) {
            throw new Error(`Animation not found: ${animationName} in spritesheet ${spritesheetAlias}`);
        }

        const animatedSprite = new AnimatedSprite(textures);
        animatedSprite.anchor.set(0.5);
        animatedSprite.play();
        return animatedSprite;
    }
}