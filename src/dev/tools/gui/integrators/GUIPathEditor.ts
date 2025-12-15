import {GUIManager} from "../tools/GUIManager";
import {MapConfig} from "../../../../configs/MapConfig";
import type {App} from "../../../../App";

export class GUIPathEditor {
    private readonly App: App;
    private readonly guiManager: GUIManager;
    private folderName = "Path Editor";

    private state = {
        pointIndex: 0,
        x: 0,
        y: 0,
        printJson: () => this.printJson()
    };

    constructor(guiManager: GUIManager, App: App) {
        this.guiManager = guiManager;
        this.App = App;
    }

    public init() {
        const folder = this.guiManager.getGui().addFolder(this.folderName);
        folder.open();

        folder.add(this.state, "pointIndex", 0, MapConfig.MAIN_PATH_POINTS.length - 1, 1)
            .name("Select Point ID")
            .onChange((index) => {
                this.syncStateWithPoint(index);
            });

        folder.add(this.state, "x", 0, 1500)
            .name("Position X")
            .listen()
            .onChange((value) => {
                this.updatePoint(this.state.pointIndex, value, this.state.y);
            });

        folder.add(this.state, "y", 0, 1500)
            .name("Position Y")
            .listen()
            .onChange((value) => {
                this.updatePoint(this.state.pointIndex, this.state.x, value);
            });

        folder.add(this.state, "printJson").name("PRINT CONFIG to Console");

        this.syncStateWithPoint(0);
    }

    private syncStateWithPoint(index: number) {
        const point = MapConfig.MAIN_PATH_POINTS[index];
        if (point) {
            this.state.x = point.x;
            this.state.y = point.y;
        }
    }

    private updatePoint(index: number, x: number, y: number) {
        const point = MapConfig.MAIN_PATH_POINTS[index];
        if (point) {
            point.x = x;
            point.y = y;
        }
    }

    private printJson() {
        const json = JSON.stringify(MapConfig.MAIN_PATH_POINTS, null, 4);
        console.log(json);
    }
}