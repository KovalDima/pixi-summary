import type { IPointData } from "pixi.js";

export enum PathNodeType {
    DEFAULT = "default",
    OBSTACLE = "obstacle",
    DETOUR = "detour",
}

export type TPathNode = {
    id: string,
    position: IPointData,
    type: PathNodeType,
}

export type TPathEdge = {
    from: string,
    to: string,
    weight: number,
}

export type TPathNeighbor = {
    node: string,
    weight: number,
}