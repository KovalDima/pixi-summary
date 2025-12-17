import { AssetsConstants } from "../../constants/AssetsConstants";
import { BoosterType, type TBoosterConfig } from "./BoosterTypes";

export class BoosterRegistry {
    private static boosterConfigs: Map<BoosterType, TBoosterConfig> = new Map([
        [
            BoosterType.ROADBLOCK,
            {
                type: BoosterType.ROADBLOCK,
                iconAlias: AssetsConstants.ROADBLOCK_BOOSTER_ALIAS,
                price: 150,
            }
        ],
    ]);

    public static getData(type: BoosterType) {
        return this.boosterConfigs.get(type);
    }
}