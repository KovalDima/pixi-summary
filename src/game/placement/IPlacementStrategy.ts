import type { IPointData } from "pixi.js";

export type TPlacementResult = {
    position: IPointData;
    isValid: boolean;
};

export interface IPlacementStrategy {
    handleMove(localPosition: IPointData): TPlacementResult;
    place(position: IPointData): void;
}