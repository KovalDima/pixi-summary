import type { Sprite } from "pixi.js";
import { Config } from "../Config";

export class EffectUtils {
    public static blinkRed(target: Sprite, duration: number = 80) {
        target.tint = Config.colors.Red;

        setTimeout(() => {
            target.tint = Config.colors.White;
        }, duration);
    }
}