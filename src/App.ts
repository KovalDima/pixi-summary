import type {Application} from "pixi.js";

export class App {
    public readonly app: Application;

    constructor(app: Application) {
        this.app = app;
        this.initDevTools();
    }

    private initDevTools() {
        if (__DEV__) {
            const { DevTools } = require("./dev/DevTools");
            new DevTools(this).init();
        }
    }
}