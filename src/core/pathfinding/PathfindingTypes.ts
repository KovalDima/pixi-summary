import type { IPointData } from "pixi.js";

export type TGraphNode = {
    id: string,
    position: IPointData,
}

export type TGraphEdge = {
    from: string,
    to: string,
    weight: number,
}