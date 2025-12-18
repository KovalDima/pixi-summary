import { Application, Assets} from "pixi.js";
import { App } from "./App";
import { Config } from "./Config";
import { manifest } from "./core/assets.manifest";

const appRoot = document.getElementById("app") as HTMLElement;
const pixiApp = new Application({
    resizeTo: window,
    backgroundColor: Config.colors.White,
    antialias: true,
});

appRoot.appendChild(pixiApp.view as HTMLCanvasElement);

Assets.init({ manifest }).then(() => {
    new App(pixiApp);
});