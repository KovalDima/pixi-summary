import type { IPointData } from "pixi.js";
import type { TGraphEdge, TGraphNode } from "../core/pathfinding/PathfindingTypes";

export class MapConfig {
    // TODO: make private again
    public static readonly MAIN_PATH_POINTS: IPointData[] = [
        {x: 848, y: 761},
        {x: 761, y: 689},
        {x: 727, y: 593},
        {x: 687, y: 515},
        {x: 614, y: 453},
        {x: 455, y: 368},
        {x: 473, y: 319},
        {x: 551, y: 306},
        {x: 631, y: 284},
        {x: 645, y: 246},
        {x: 609, y: 203},
        {x: 529, y: 181},
        {x: 453, y: 192},
        {x: 397, y: 232},
        {x: 339, y: 335},
        {x: 348, y: 402},
        {x: 411, y: 473},
        {x: 404, y: 504},
        {x: 373, y: 522},
        {x: 315, y: 507},
        {x: 246, y: 480},
        {x: 201, y: 504},
        {x: 190, y: 551},
        {x: 212, y: 591},
        {x: 306, y: 634},
        {x: 384, y: 634},
        {x: 455, y: 591},
        {x: 482, y: 544},
        {x: 515, y: 480},
        {x: 716, y: 342},
        {x: 776, y: 346},
        {x: 832, y: 386},
        {x: 850, y: 435},
        {x: 836, y: 491},
        {x: 792, y: 527},
        {x: 620, y: 585},
        {x: 591, y: 634},
        {x: 576, y: 707},
        {x: 542, y: 754},
        {x: 466, y: 801},
        {x: 368, y: 803},
        {x: 306, y: 772},
        {x: 226, y: 692},
        {x: 232, y: 634},
    ];
    public static readonly START_NODE_ID = "node_0";

    public static getNodes(): TGraphNode[] {
        return this.MAIN_PATH_POINTS.map((pos, index) => ({
            id: `node_${index}`,
            position: pos
        }));
    }

    public static getEdges(): TGraphEdge[] {
        const edges: TGraphEdge[] = [];
        const totalPoints = this.MAIN_PATH_POINTS.length;

        for (let i = 0; i < totalPoints - 1; i++) {
            edges.push({
                from: `node_${i}`,
                to: `node_${i + 1}`,
                weight: 1
            });
        }
        return edges;
    }

    public static getFinishNodeId() {
        return `node_${this.MAIN_PATH_POINTS.length - 1}`;
    }
}