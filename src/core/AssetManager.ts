import { Assets } from "pixi.js";
import { AssetsConstants } from "../constants/AssetsConstants";

export class AssetManager {
    public static async loadCoreAssets() {
        return await Assets.loadBundle(AssetsConstants.CORE_BUNDLE);
    }

    public static async loadGameAssets() {
        return await Assets.loadBundle(AssetsConstants.GAME_BUNDLE);
    }
}

