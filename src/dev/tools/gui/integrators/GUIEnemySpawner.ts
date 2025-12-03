import { GUIManager } from "../tools/GUIManager";
import { ButtonControl } from "../tools/ButtonControl";
import type { App} from "../../../../App";

export class GUIEnemySpawner {
    private readonly App: App;
    private readonly guiManager: GUIManager;
    private readonly folderName = "Debug Actions";

    private actions = {
        spawnEnemy: () => {
            this.App.entityManager.spawnEnemy();
        },
        debugShowAll: () => {
            this.App.entityManager.debugSpawnAllPoints();
        }
    };

    constructor(guiManager: GUIManager, App: App) {
        this.guiManager = guiManager;
        this.App = App;
        this.initControls();
    }

    private initControls() {
        this.guiManager.addControls([
            new ButtonControl(this.actions, {
                label: "Spawn Monster",
                methodName: "spawnEnemy"
            }),
            new ButtonControl(this.actions, {
                label: "Show All Points",
                methodName: "debugShowAll"
            })
        ], this.folderName);
    }
}