import type { TGraphEdge, TGraphNode } from "./PathfindingTypes";

export class PathfindingService {
    private nodes: Map<string, TGraphNode> = new Map();
    private adjacencyList: Map<string, { node: string; weight: number }[]> = new Map();

    constructor(nodes: TGraphNode[], edges: TGraphEdge[]) {
        this.buildGraph(nodes, edges);
    }

    private buildGraph(nodes: TGraphNode[], edges: TGraphEdge[]) {
        nodes.forEach(node => {
            this.nodes.set(node.id, node);
            this.adjacencyList.set(node.id, []);
        });

        edges.forEach(edge => {
            const fromNode = this.adjacencyList.get(edge.from);
            if (fromNode) {
                fromNode.push({ node: edge.to, weight: edge.weight });
            }
        });
    }

    // розбити на менші приватні методи
    public findPath(startId: string, endId: string): TGraphNode[] {
        const distances: Map<string, number> = new Map();
        const previous: Map<string, string | null> = new Map();
        const unvisited: Set<string> = new Set();

        this.nodes.forEach((_, id) => {
            distances.set(id, Infinity);
            previous.set(id, null);
            unvisited.add(id);
        });

        distances.set(startId, 0);

        while (unvisited.size > 0) {
            let currentNodeId: string | null = null;
            let minDistance = Infinity;

            unvisited.forEach(id => {
                const dist = distances.get(id)!;
                if (dist < minDistance) {
                    minDistance = dist;
                    currentNodeId = id;
                }
            });

            if (currentNodeId === null || currentNodeId === endId) break;

            unvisited.delete(currentNodeId);

            const neighbors = this.adjacencyList.get(currentNodeId) || [];
            for (const neighbor of neighbors) {
                if (!unvisited.has(neighbor.node)) continue;

                const newDist = distances.get(currentNodeId)! + neighbor.weight;
                if (newDist < distances.get(neighbor.node)!) {
                    distances.set(neighbor.node, newDist);
                    previous.set(neighbor.node, currentNodeId);
                }
            }
        }

        const path: TGraphNode[] = [];
        let current: string | null = endId;

        if (distances.get(endId) === Infinity) return [];

        while (current !== null) {
            const node = this.nodes.get(current);
            if (node) path.unshift(node);
            current = previous.get(current) || null;
        }

        return path;
    }
}