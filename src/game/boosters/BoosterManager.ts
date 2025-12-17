import { Container } from "pixi.js";
import { type SpriteService } from "../../services/SpriteService";
import { type SoundService } from "../../services/SoundService";
import { type EntityManager } from "../EntityManager";
import { AssetsConstants } from "../../constants/AssetsConstants";
import { MapConfig } from "../../configs/MapConfig";
import { PathNodeType, type TPathNode } from "../../core/pathfinding/PathfindingTypes";
import { Config } from "../../Config";
import { DepthCalculator } from "../../utils/DepthCalculator";
import { HighlightService } from "../../services/HighlightService";

export class BoosterManager {
    private readonly gameContainer: Container;
    private readonly spriteService: SpriteService;
    private readonly soundService: SoundService;
    private readonly entityManager: EntityManager;
    private readonly highlightService: HighlightService;

    constructor(
        gameContainer: Container,
        spriteService: SpriteService,
        soundService: SoundService,
        entityManager: EntityManager,
        highlightService: HighlightService
    ) {
        this.gameContainer = gameContainer;
        this.spriteService = spriteService;
        this.soundService = soundService;
        this.entityManager = entityManager;
        this.highlightService = highlightService;
    }

    public addRoadblock(nodeId: string) {
        const node = MapConfig.getNodes().find(node => node.id === nodeId);

        if (!node) {
            return;
        }

        const roadblock = this.spriteService.createSprite(AssetsConstants.ROADBLOCK_BOOSTER_ALIAS);

        // TODO: not towerScale
        const scale = DepthCalculator.getTowerScale(node.position.y);

        roadblock.position.copyFrom(node.position);
        roadblock.scale.set(scale);
        roadblock.zIndex = node.position.y;

        this.gameContainer.addChild(roadblock);
        this.gameContainer.sortChildren();
        this.entityManager.registerObstacle(nodeId);

        // TODO: another sound here
        this.soundService.play(AssetsConstants.SOUND_ROADBLOCK_BOOSTER);
    }

    public getAvailableNodes(): TPathNode[] {
        const occupiedNodes = this.entityManager.getOccupiedNodes();

        return MapConfig.getNodes().filter(
            (node) => node.type === PathNodeType.OBSTACLE && !occupiedNodes.has(node.id)
        );
    }

    public highlightAvailableNodes() {
        const availablePositions = this.getAvailableNodes().map((node) => node.position);

        this.highlightService.show(availablePositions, {
            color: Config.colors.Green,
            alpha: 0.2,
            radius: 20,
            lineWidth: 2,
            lineColor: Config.colors.Green
        });
    }

    public hideHighlights() {
        this.highlightService.clear();
    }
}