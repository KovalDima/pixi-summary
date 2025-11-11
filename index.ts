import {Application} from "pixi.js";
import {App} from "./src/App";

const appRoot = document.getElementById("app") as HTMLElement;
const pixiApp = new Application({
    resizeTo: window,
    backgroundColor: 0xd5cbcb,
    antialias: true,
});

appRoot.appendChild(pixiApp.view as HTMLCanvasElement);
new App(pixiApp);