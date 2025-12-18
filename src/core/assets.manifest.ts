import { AssetsConstants } from "../constants/AssetsConstants";

export const manifest = {
    bundles: [
        {
            name: AssetsConstants.CORE_BUNDLE,
            assets: [
                { alias: AssetsConstants.SYMBOLS_ATLAS_ALIAS, src: "resources/spritesheets/textures.json" },
                { alias: AssetsConstants.BACKGROUND_ALIAS, src: "resources/background/water.png" },
                { alias: AssetsConstants.GAME_MAP_ALIAS, src: "resources/background/map.png" },
                { alias: AssetsConstants.FONT_VCR_ALIAS, src: "resources/fonts/VCR_OSD_MONO.ttf" },
                { alias: AssetsConstants.START_SCREEN_ALIAS, src: "resources/start_screen/start_screen.jpg" }
            ],
        },
        {
            name: AssetsConstants.GAME_BUNDLE,
            assets: [
                { alias: AssetsConstants.FLAME_ANIM_ALIAS, src: "resources/spritesheets/flame_anim.json" },
                { alias: AssetsConstants.ARCHER_TOWER_ANIM_ALIAS, src: "resources/spritesheets/tower_2_progress.json" }
            ]
        }
    ],
};