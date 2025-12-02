export enum TowerType {
    REGULAR_TOWER = "regular_tower",
    ARCHER_TOWER = "archer_tower",
}

export type TTowerConfig = {
    type: TowerType,
    assetAlias: string,
    iconAlias: string,
    price: number,
    animationName?: string,
    animationSpeed?: number,
}