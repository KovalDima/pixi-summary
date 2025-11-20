import { AssetsConstants } from "../constants/AssetsConstants";

export const manifest = {
    bundles: [
        {
            name: AssetsConstants.CORE_BUNDLE,
            assets: [
                { alias: AssetsConstants.BACKGROUND_ALIAS, src: "resources/background/water.png" },
                { alias: AssetsConstants.GAME_MAP_ALIAS, src: "resources/background/map.png" },
            ],
        },
        {
            name: AssetsConstants.GAME_BUNDLE,
            assets: [
                { alias: AssetsConstants.FLAME_ANIM_ALIAS, src: "resources/spritesheets/flame_anim.json" },
                { alias: AssetsConstants.TOWER_1_ALIAS, src: "resources/towers/tower_1.png" },
            ]
        }
    ],
};