import { AssetsConstants } from "../../constants/AssetsConstants";
import { AnimationConstants } from "../../constants/AnimationConstants";
import { TowerType, type TTowerConfig } from "./TowerTypes";

export class TowerRegistry {
    private static towerConfigs: Map<TowerType, TTowerConfig> = new Map([
        [
            TowerType.REGULAR_TOWER,
            {
                type: TowerType.REGULAR_TOWER,
                assetAlias: AssetsConstants.REGULAR_TOWER_ALIAS,
                iconAlias: AssetsConstants.REGULAR_TOWER_ALIAS,
                price: 100,
                damage: 15,
                range: 140,
                fireRate: 2000,
                projectileSpeed: 3,
                projectileAlias: AssetsConstants.PROJECTILE_ALIAS,
                projectileType: "arc",
            }
        ],
        [
            TowerType.ARCHER_TOWER,
            {
                type: TowerType.ARCHER_TOWER,
                assetAlias: AssetsConstants.ARCHER_TOWER_ANIM_ALIAS,
                iconAlias: AssetsConstants.ARCHER_TOWER_ALIAS,
                price: 200,
                animationName: AnimationConstants.ARCHER_TOWER_BUILDING,
                animationSpeed: 0.03,
                damage: 10,
                range: 180,
                fireRate: 1200,
                projectileSpeed: 6,
                projectileAlias: AssetsConstants.ARROW_ALIAS,
                projectileType: "linear",
            }
        ]
    ]);

    public static getData(type: TowerType) {
        return this.towerConfigs.get(type);
    }
}