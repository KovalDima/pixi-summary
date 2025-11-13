import {Application} from "pixi.js";
import {App} from "./App";
import { Assets } from "pixi.js";
import { manifest } from "./core/assets.manifest";

const appRoot = document.getElementById("app") as HTMLElement;
const pixiApp = new Application({
    resizeTo: window,
    backgroundColor: 0xd5cbcb,
    antialias: true,
});

appRoot.appendChild(pixiApp.view as HTMLCanvasElement);
Assets.init({ manifest }).then(() => {
    new App(pixiApp);
});