import { GUIManager } from "../tools/GUIManager";
import { ButtonControl } from "../tools/ButtonControl";
import type { App} from "../../../../App";

export class GUIEnemySpawner {
    private readonly App: App;
    private readonly guiManager: GUIManager;
    private readonly folderName = "Debug Actions";


    constructor(guiManager: GUIManager, App: App) {
        this.guiManager = guiManager;
        this.App = App;
    }
}