import type { TPathNode, TPathEdge, TPathNeighbor } from "./PathfindingTypes";

export class PathfindingService {
    private nodes: Map<string, TPathNode> = new Map();
    private edges: TPathEdge[] = [];
    private adjacencyList: Map<string, TPathNeighbor[]> = new Map();

    constructor(nodes: TPathNode[], edges: TPathEdge[]) {
        nodes.forEach(node => {
            this.nodes.set(node.id, node);
        });
        this.edges = JSON.parse(JSON.stringify(edges));
        this.buildPath();
    }

    public setNodeBlocked(nodeId: string, isBlocked: boolean) {
        const defaultEdgeWeight = 1;
        this.edges.forEach(edge => {
            if (edge.to === nodeId) {
                edge.weight = isBlocked ? Infinity : defaultEdgeWeight;
            }
        });
        this.buildPath();
    }

    private buildPath() {
        this.adjacencyList.clear();

        this.nodes.forEach(node => {
            this.adjacencyList.set(node.id, []);
        });

        this.edges.forEach(edge => {
            if (edge.weight !== Infinity) {
                const fromNode = this.adjacencyList.get(edge.from);
                if (fromNode) {
                    fromNode.push({ node: edge.to, weight: edge.weight });
                }
            }
        });
    }

    // TODO:
    //  розбити на менші приватні методи?
    public findPath(startId: string, endId: string): TPathNode[] {
        const distances: Map<string, number> = new Map();
        const previous: Map<string, string | null> = new Map();
        const unvisited: Set<string> = new Set();

        distances.set(startId, 0);

        this.nodes.forEach((_, id) => {
            distances.set(id, Infinity);
            previous.set(id, null);
            unvisited.add(id);
        });

        while (unvisited.size > 0) {
            let currentNodeId: string | null = null;
            let minDistance = Infinity;

            unvisited.forEach(id => {
                const dist = distances.get(id)!; // remove !
                if (dist < minDistance) {
                    minDistance = dist;
                    currentNodeId = id;
                }
            });

            if (currentNodeId === null || currentNodeId === endId || minDistance === Infinity) {
                break;
            }

            unvisited.delete(currentNodeId);

            const neighbors = this.adjacencyList.get(currentNodeId) || [];

            for (const neighbor of neighbors) {
                if (!unvisited.has(neighbor.node)) {
                    continue;
                }

                const newDistance = distances.get(currentNodeId)! + neighbor.weight; // remove !

                if (newDistance < distances.get(neighbor.node)!) { // remove !
                    distances.set(neighbor.node, newDistance);
                    previous.set(neighbor.node, currentNodeId);
                }
            }
        }

        const path: TPathNode[] = [];
        let current: string | null = endId;

        if (distances.get(endId) === Infinity) {
            return [];
        }

        while (current !== null) {
            const node = this.nodes.get(current);
            if (node) path.unshift(node);
            current = previous.get(current) || null;
        }

        return path;
    }
}