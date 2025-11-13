import { AssetsBundleConstants } from "../constants/AssetsBundleConstants";

export const manifest = {
    bundles: [
        {
            name: AssetsBundleConstants.CORE_BUNDLE,
            assets: [
                { alias: "background", src: "resources/background/water.png" },
                { alias: "gameMap", src: "resources/background/map.png" },
            ],
        },
    ],
};