import Stats from "stats.js";
import type {App} from "../App";

export class DevTools {
    private readonly App: App;

    constructor(App: App) {
        this.App = App;
    }

    public init() {
        this.runStats();
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