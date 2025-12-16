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
                { alias: AssetsConstants.SYMBOLS_ATLAS_ALIAS, src: "resources/spritesheets/textures.json" },
                { alias: AssetsConstants.ROADBLOCK_BOOSTER_ALIAS, src: "resources/boosters/roadblock_booster.png" },
                { alias: AssetsConstants.MAGIC_GATE_ALIAS, src: "resources/gate/magic_gate.png" },
                { alias: AssetsConstants.PROJECTILE_ALIAS, src: "resources/projectiles/projectile.png" },
                { alias: AssetsConstants.ARROW_ALIAS, src: "resources/projectiles/arrow.png" },
                { alias: AssetsConstants.UI_INFO_BAR_ALIAS, src: "resources/ui/info_bar.png" },
                { alias: AssetsConstants.UI_ITEM_SLOT_ALIAS, src: "resources/ui/item_holder.png" },
                { alias: AssetsConstants.UI_ITEMS_PANEL_ALIAS, src: "resources/ui/items_holder.png" },
                { alias: AssetsConstants.UI_BTN_NEXT_WAVE_ALIAS, src: "resources/ui/btn_next_wave.png" },
            ]
        }
    ],
};