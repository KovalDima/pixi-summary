import { Assets } from "pixi.js";

export class AssetManager {
    public static async loadCoreAssets() {
        return await Assets.loadBundle("core");
    }
}

