import { AssetsConstants } from "../constants/AssetsConstants";

export const manifest = {
    bundles: [
        {
            name: AssetsConstants.CORE_BUNDLE,
            assets: [
                { alias: AssetsConstants.BACKGROUND_ALIAS, src: "resources/background/water.png" },
                { alias: AssetsConstants.GAME_MAP_ALIAS, src: "resources/background/map.png" },
                { alias: AssetsConstants.FONT_VCR_ALIAS, src: "resources/fonts/VCR_OSD_MONO.ttf" },
            ],
        },
        {
            name: AssetsConstants.GAME_BUNDLE,
            assets: [
                { alias: AssetsConstants.FLAME_ANIM_ALIAS, src: "resources/spritesheets/flame_anim.json" },
                { alias: AssetsConstants.REGULAR_TOWER_ALIAS, src: "resources/towers/tower_1.png" },
                { alias: AssetsConstants.ARCHER_TOWER_ALIAS, src: "resources/towers/tower_2_4.png" },
                { alias: AssetsConstants.ARCHER_TOWER_ANIM_ALIAS, src: "resources/spritesheets/tower_2_progress.json" },
                { alias: AssetsConstants.SYMBOLS_ATLAS_ALIAS, src: "resources/spritesheets/symbols.json" },
                { alias: AssetsConstants.ROADBLOCK_BOOSTER_ALIAS, src: "resources/boosters/roadblock_booster.png" },
            ]
        }
    ],
};