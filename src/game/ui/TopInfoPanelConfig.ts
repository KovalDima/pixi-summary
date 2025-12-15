import { Config } from "../../Config";

export class TopInfoPanelConfig {
    private readonly labelFontSize = 25;
    private readonly labelPositionY = 30;
    private readonly labelTint = 50;
    private readonly valueFontSize = 80;
    private readonly valuePositionY = Config.colors.White;
    private readonly valueTint = Config.colors.Brown;

    public static readonly ITEMS = {
        points: {
            label: "Score",
            value: "100M500K",
        },
        wave: {
            label: "Wave",
            value: "7",
        },
        nextWave: {
            label: "Next wave",
            value: "1:43",
        },
        killed: {
            label: "Killed",
            value: "3/14",
        }
    }
}