import { BitmapFont, BitmapText } from "pixi.js";
import { FontConstants } from "../constants/FontConstants";

export type TTextOptions = {
    fontSize?: number,
    tint?: number,
    align?: "left" | "center" | "right"
}

export class BitmapTextService {
    private static initialized = false;

    constructor() {
        this.init();
    }

    private init() {
        if (BitmapTextService.initialized) {
            return;
        }

        BitmapFont.from(FontConstants.BITMAP_VCR_FONT.fontName, FontConstants.BITMAP_VCR_FONT);
        BitmapTextService.initialized = true;
    }

    public createText(text: string, options: TTextOptions) {
        const bitmapText = new BitmapText(text, {
            fontName: FontConstants.BITMAP_VCR_FONT.fontName,
            fontSize: options.fontSize ?? FontConstants.BITMAP_VCR_FONT.fontSize,
            align: options.align ?? "center"
        });

        if (options.tint) {
            bitmapText.tint = options.tint;
        }

        return bitmapText;
    }
}