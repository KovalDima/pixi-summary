import {GUIManager} from "../tools/GUIManager";
import {CheckboxControl} from "../tools/CheckboxControl";
import {ContainersHighlighter} from "../../ContainersHighlighter";
import type {App} from "../../../../App";

export class GUIContainersHighlighter {
    private readonly App: App;
    private readonly guiManager: GUIManager;
    private readonly highlighter: ContainersHighlighter;
    private readonly highlightSettings = {
        enabled: false
    };
    private readonly folderName = "Highlight Containers";

    constructor(guiManager: GUIManager, App: App) {
        this.guiManager = guiManager;
        this.App = App;
        this.highlighter = new ContainersHighlighter(this.App.app);
        this.initControls();

        this.App.app.ticker.add(() => {
            this.highlighter.update();
        })
    }

    private initControls() {
        this.guiManager.addControls([
            new CheckboxControl(this.highlightSettings, {
                property: "enabled",
                label: "Enabled Highlight",
                onChange: (value: boolean) => {
                    this.highlighter.setEnabled(value);
                }
            })
        ], this.folderName)
    }
}
