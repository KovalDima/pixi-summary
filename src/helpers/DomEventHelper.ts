import { utils } from "pixi.js";

export class DomEventHelper extends utils.EventEmitter {
    constructor() {
        super();
        window.addEventListener("keydown", (e) => this.emit("keydown", e));
    }
}