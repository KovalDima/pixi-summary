export enum BoosterType {
    ROADBLOCK = "roadblock"
}

export type TBoosterConfig = {
    type: BoosterType,
    iconAlias: string,
    price: number,
}