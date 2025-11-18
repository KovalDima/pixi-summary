import { Howl } from "howler";
import soundManifest from "../core/sounds_manifest.json";

type TSoundName = keyof typeof soundManifest.sounds;

export class SoundService {
    private sounds: Map<TSoundName, Howl> = new Map();

    constructor() {
        this.initSounds();
    }

    private initSounds() {
        const basePath = soundManifest.basePath;
        const soundEntries = soundManifest.sounds;

        for (const soundName in soundEntries) {
            const sound = new Howl({
                src: [`${basePath}${soundEntries[soundName as TSoundName]}`],
            });
            this.sounds.set(soundName as TSoundName, sound);
        }
    }

    public play(name: TSoundName) {
        this.getSound(name).play();
    }

    public stop(name: TSoundName) {
        this.getSound(name).stop();
    }

    private getSound(name: TSoundName) {
        const sound = this.sounds.get(name);
        if (!sound) {
            throw new Error(`SoundService: Sound not found or not loaded: ${name}`);
        }
        return sound;
    }
}