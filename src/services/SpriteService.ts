import { Assets, Sprite } from "pixi.js";

export class SpriteService {
    public createSprite(textureAlias: string) {
        const texture = Assets.get(textureAlias);

        if (!texture) {
            throw new Error(`Texture not found: ${textureAlias}`);
        }

        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        return sprite;
    }
}