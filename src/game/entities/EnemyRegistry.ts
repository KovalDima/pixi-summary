import { AssetsConstants } from "../../constants/AssetsConstants";
import { EnemyType, type TEnemyTypeConfig } from "./EnemyTypes";

export class EnemyRegistry {
    private static configs: Map<EnemyType, TEnemyTypeConfig> = new Map([
        [
            EnemyType.REGULAR,
            {
                type: EnemyType.REGULAR,
                textureAlias: AssetsConstants.MONSTER_TEXTURE_ALIAS,
                speed: 2,
                scaleMultiplier: 1.75,
                hpMultiplier: 1,
                rewardMultiplier: 1,
                ignoreSlowdown: false,
                showHealthBar: false,
            }
        ],
        [
            EnemyType.POWERFUL,
            {
                type: EnemyType.POWERFUL,
                textureAlias: AssetsConstants.MONSTER_POWERFUL_TEXTURE_ALIAS,
                speed: 2,
                scaleMultiplier: 2.2,
                hpMultiplier: 2,
                rewardMultiplier: 3,
                ignoreSlowdown: true,
                showHealthBar: true,
            }
        ]
    ]);

    public static getTypeConfig(type: EnemyType) {
        const config = this.configs.get(type);
        if (!config) {
            throw new Error(`Config for enemy type ${type} not found`);
        }
        return config;
    }
}