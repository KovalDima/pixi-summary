import Stats from "stats.js";
import {initDevtools as initPixiDevTools} from "@pixi/devtools";
import {GUIManager} from "./tools/gui/tools/GUIManager";
import type {App} from "../App";

export class DevTools {
    private readonly App: App;

    constructor(App: App) {
        this.App = App;
    }

    public init() {
        this.runStats();
        void initPixiDevTools({app: this.App.app});
        return this;
    }

    public initGUI() {
        const guiManager = new GUIManager();

        this.App.app.ticker.add(() => {
            guiManager.update();
        });
    }

    private runStats() {
        const stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
        this.App.app.ticker.add(() => {
            stats.update();
        });
    }
}