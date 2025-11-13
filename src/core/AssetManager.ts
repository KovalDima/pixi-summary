import { Assets } from "pixi.js";
import { AssetsBundleConstants } from "../constants/AssetsBundleConstants";

export class AssetManager {
    public static async loadCoreAssets() {
        return await Assets.loadBundle(AssetsBundleConstants.CORE_BUNDLE);
    }
}

