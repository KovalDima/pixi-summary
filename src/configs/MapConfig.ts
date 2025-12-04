import type {IPointData} from "pixi.js";
import {PathNodeType, type TPathEdge, type TPathNode} from "../core/pathfinding/PathfindingTypes";

export type TDetourConfig = {
    obstacleIndex: number,
    enterIndex: number,
    exitIndex: number,
    detourPoints: IPointData[],
};

export class MapConfig {
    // TODO: make private again
    public static readonly MAIN_PATH_POINTS: IPointData[] = [
        {x: 848, y: 761}, {x: 761, y: 689}, {x: 727, y: 593},
        {x: 687, y: 515}, {x: 614, y: 453}, {x: 455, y: 368},
        {x: 473, y: 319}, {x: 551, y: 306}, {x: 631, y: 284},
        {x: 645, y: 246}, {x: 609, y: 203}, {x: 529, y: 181},
        {x: 453, y: 192}, {x: 397, y: 232}, {x: 339, y: 335},
        {x: 348, y: 402}, {x: 411, y: 473}, {x: 404, y: 504},
        {x: 373, y: 522}, {x: 315, y: 507}, {x: 246, y: 480},
        {x: 201, y: 504}, {x: 190, y: 551}, {x: 212, y: 591},
        {x: 306, y: 634}, {x: 384, y: 634}, {x: 455, y: 591},
        {x: 482, y: 544}, {x: 515, y: 480}, {x: 716, y: 342},
        {x: 776, y: 346}, {x: 832, y: 386}, {x: 850, y: 435},
        {x: 836, y: 491}, {x: 792, y: 527}, {x: 620, y: 585},
        {x: 591, y: 634}, {x: 576, y: 707}, {x: 542, y: 754},
        {x: 466, y: 801}, {x: 368, y: 803}, {x: 306, y: 772},
        {x: 226, y: 692}, {x: 232, y: 634},
    ];

    private static readonly OBSTACLES_DATA: TDetourConfig[] = [
        {
            obstacleIndex: 1,
            enterIndex: 1,
            exitIndex: 3,
            detourPoints: [{ x: 700, y: 680 }, { x: 690, y: 595 }]
        }, // done
        {
            obstacleIndex: 3,
            enterIndex: 3,
            exitIndex: 5,
            detourPoints: [{ x: 300, y: 280 }, { x: 280, y: 380 }, { x: 280, y: 450 }]
        }, // not done
        // others here ...
    ];

    public static readonly START_NODE_ID = "main_node_0";

    public static getNodes(): TPathNode[] {
        const nodes: TPathNode[] = [];

        this.MAIN_PATH_POINTS.forEach((position, index) => {
           const isObstacle = this.OBSTACLES_DATA.some(obstacle => obstacle.obstacleIndex === index);
           nodes.push({
               id: `main_node_${index}`,
               position,
               type: isObstacle ? PathNodeType.OBSTACLE : PathNodeType.DEFAULT
           });
        });

        this.OBSTACLES_DATA.forEach(obstacle => {
            obstacle.detourPoints.forEach((position, index) => {
                nodes.push({
                    id: `detour_node_${obstacle.obstacleIndex}_${index}`,
                    position,
                    type: PathNodeType.DETOUR
                });
            });
        });

        return nodes;
    }

    public static getEdges(): TPathEdge[] {
        const edges: TPathEdge[] = [];
        const totalPoints = this.MAIN_PATH_POINTS.length;

        for (let i = 0; i < totalPoints - 1; i++) {
            edges.push({
                from: `main_node_${i}`,
                to: `main_node_${i + 1}`,
                weight: 1
            });
        }

        this.OBSTACLES_DATA.forEach(obstacle => {
            edges.push({
                from: `main_node_${obstacle.enterIndex}`,
                to: `detour_node_${obstacle.obstacleIndex}_0`,
                weight: 1
            });

            for (let i = 0; i < obstacle.detourPoints.length - 1; i++) {
                edges.push({
                    from: `detour_node_${obstacle.obstacleIndex}_${i}`,
                    to: `detour_node_${obstacle.obstacleIndex}_${i + 1}`,
                    weight: 1 // weight more?
                });
            }

            edges.push({
                from: `detour_node_${obstacle.obstacleIndex}_${obstacle.detourPoints.length - 1}`,
                to: `main_node_${obstacle.exitIndex}`,
                weight: 1
            });
        });

        console.log(edges);
        return edges;
    }

    public static getFinishNodeId() {
        return `main_node_${this.MAIN_PATH_POINTS.length - 1}`;
    }
}