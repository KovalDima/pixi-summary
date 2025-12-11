import type {IPointData} from "pixi.js";
import {PathNodeType, type TPathEdge, type TPathNode} from "../core/pathfinding/PathfindingTypes";

export type TDetourConfig = {
    obstacleIndex: number,
    enterIndex: number,
    exitIndex: number,
    detourPoints: IPointData[],
};

export type TTowerSlot = {
    id: string;
    position: IPointData;
}

export class MapConfig {
    // TODO: make private again (after debug)
    public static readonly MAIN_PATH_POINTS: IPointData[] = [
        {"x": 850, "y": 739}, {"x": 778, "y": 688}, {"x": 748, "y": 652}, {"x": 734, "y": 593},
        {"x": 700, "y": 515}, {"x": 670, "y": 477}, {"x": 621, "y": 442}, {"x": 462, "y": 368},
        {"x": 462, "y": 314}, {"x": 556, "y": 289}, {"x": 625, "y": 274}, {"x": 642, "y": 258},
        {"x": 647, "y": 241}, {"x": 609, "y": 188}, {"x": 529, "y": 166}, {"x": 453, "y": 177},
        {"x": 384, "y": 232}, {"x": 360, "y": 260}, {"x": 335, "y": 335}, {"x": 360, "y": 402},
        {"x": 389, "y": 427}, {"x": 416, "y": 473}, {"x": 397, "y": 499}, {"x": 362, "y": 507},
        {"x": 314, "y": 491}, {"x": 255, "y": 467}, {"x": 204, "y": 486}, {"x": 188, "y": 532},
        {"x": 217, "y": 565}, {"x": 244, "y": 593}, {"x": 306, "y": 615}, {"x": 386, "y": 618},
        {"x": 448, "y": 585}, {"x": 483, "y": 529}, {"x": 510, "y": 470}, {"x": 695, "y": 333},
        {"x": 763, "y": 327}, {"x": 806, "y": 346}, {"x": 841, "y": 386}, {"x": 849, "y": 435},
        {"x": 835, "y": 481}, {"x": 784, "y": 515}, {"x": 623, "y": 564}, {"x": 591, "y": 618},
        {"x": 585, "y": 663}, {"x": 566, "y": 714}, {"x": 526, "y": 754}, {"x": 462, "y": 787},
        {"x": 368, "y": 787}, {"x": 300, "y": 749}, {"x": 239, "y": 692}, {"x": 229, "y": 650}
    ];

    private static readonly OBSTACLES_DATA: TDetourConfig[] = [
        {
            obstacleIndex: 2,
            enterIndex: 1,
            exitIndex: 4,
            detourPoints: [{x: 708, y: 680}, {x: 690, y: 595}]
        },
        {
            obstacleIndex: 5,
            enterIndex: 4,
            exitIndex: 7,
            detourPoints: [{x: 708, y: 460}, {x: 655, y: 420}, {x: 560, y: 373}]
        },
        {
            obstacleIndex: 11,
            enterIndex: 10,
            exitIndex: 15,
            detourPoints: [{x: 522, y: 250}, {x: 496, y: 200}]
        },
        {
            obstacleIndex: 17,
            enterIndex: 16,
            exitIndex: 19,
            detourPoints: [{x: 313, y: 255}, {x: 300, y: 366}]
        },
        {
            obstacleIndex: 20,
            enterIndex: 19,
            exitIndex: 25,
            detourPoints: [{x: 290, y: 451}]
        },
        {
            obstacleIndex: 28,
            enterIndex: 27,
            exitIndex: 32,
            detourPoints: [{x: 279, y: 557}, {x: 341, y: 583}, {x: 410, y: 582}]
        },
        {
            obstacleIndex: 37,
            enterIndex: 36,
            exitIndex: 41,
            detourPoints: [{x: 800, y: 420}, {x: 800, y: 470}]
        },
        {
            obstacleIndex: 44,
            enterIndex: 43,
            exitIndex: 48,
            detourPoints: [{x: 500, y: 720}, {x: 410, y: 765}]
        },
    ];

    public static readonly START_NODE_ID = "main_node_0";

    private static readonly TOWER_SLOT_POSITIONS: IPointData[] = [
        { x: 296, y: 203 }, { x: 765, y: 241 }, { x: 205, y: 361 }, { x: 830, y: 615 },
        { x: 435, y: 704 }, { x: 575, y: 233 }, { x: 459, y: 248 }, { x: 466, y: 433 },
        { x: 252, y: 524 }, { x: 161, y: 611 }, { x: 324, y: 688 }, { x: 521, y: 626 },
        { x: 575, y: 517 }, { x: 721, y: 393 }, { x: 757, y: 452 }, { x: 550, y: 815 },
        { x: 659, y: 641 }, { x: 917, y: 477 },
    ];

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
        const mainPathEdgeWeight = 1;
        const detourEdgeWeight = 20;

        for (let i = 0; i < totalPoints - 1; i++) {
            edges.push({
                from: `main_node_${i}`,
                to: `main_node_${i + 1}`,
                weight: mainPathEdgeWeight
            });
        }

        this.OBSTACLES_DATA.forEach(obstacle => {
            edges.push({
                from: `main_node_${obstacle.enterIndex}`,
                to: `detour_node_${obstacle.obstacleIndex}_0`,
                weight: detourEdgeWeight
            });

            for (let i = 0; i < obstacle.detourPoints.length - 1; i++) {
                edges.push({
                    from: `detour_node_${obstacle.obstacleIndex}_${i}`,
                    to: `detour_node_${obstacle.obstacleIndex}_${i + 1}`,
                    weight: detourEdgeWeight
                });
            }

            edges.push({
                from: `detour_node_${obstacle.obstacleIndex}_${obstacle.detourPoints.length - 1}`,
                to: `main_node_${obstacle.exitIndex}`,
                weight: detourEdgeWeight
            });
        });

        return edges;
    }

    public static getFinishNodeId() {
        return `main_node_${this.MAIN_PATH_POINTS.length - 1}`;
    }

    public static getFinishNodePosition() {
        return this.MAIN_PATH_POINTS.at(-1) ?? {x: 0, y: 0};
    }

    public static getTowerSlots(): TTowerSlot[] {
        return this.TOWER_SLOT_POSITIONS.map((position, index) => ({
            id: `tower_slot_${index}`,
            position
        }));
    }
}