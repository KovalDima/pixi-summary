import { AssetsConstants } from "../constants/AssetsConstants";

export const manifest = {
    bundles: [
        {
            name: AssetsConstants.CORE_BUNDLE,
            assets: [
                { alias: "background", src: "resources/background/water.png" },
                { alias: "gameMap", src: "resources/background/map.png" },
            ],
        },
        {
            name: AssetsConstants.GAME_BUNDLE,
            assets: [
                { alias: AssetsConstants.FLAME_ANIM_ALIAS, src: "resources/spritesheets/flame_anim.json" },
            ]
        }
    ],
};