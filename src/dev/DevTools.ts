import Stats from "stats.js";
import {initDevtools as initPixiDevTools} from "@pixi/devtools";
import {GUIManager} from "./tools/gui/tools/GUIManager";
import type {App} from "../App";
import {GUIContainersHighlighter} from "./tools/gui/integrators/GUIContainersHighlighter";
import {GUIEnemySpawner} from "./tools/gui/integrators/GUIEnemySpawner";
import {GUIPathEditor} from "./tools/gui/integrators/GUIPathEditor";

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

        new GUIContainersHighlighter(guiManager, this.App);
        new GUIEnemySpawner(guiManager, this.App);

        const editor = new GUIPathEditor(guiManager, this.App);
        editor.init();

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