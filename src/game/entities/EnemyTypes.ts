export enum EnemyType {
    REGULAR = "regular",
    POWERFUL = "powerful",
}

export type TEnemyBaseConfig = {
    textureAlias: string,
    speed: number,
    scaleMultiplier: number,
    ignoreSlowdown: boolean,
    showHealthBar: boolean,
}

export type TEnemyTypeConfig = {
    type: EnemyType,
    hpMultiplier: number,
    rewardMultiplier: number,
} & TEnemyBaseConfig;

export type TEnemyConfig = {
    hp: number,
    reward: number,
    damageToPlayer: number,
} & TEnemyBaseConfig;