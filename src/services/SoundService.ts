import { Howl } from "howler";
import soundManifest from "../core/sounds_manifest.json";

type TSoundName = keyof typeof soundManifest.sounds;

export class SoundService {
    private sounds: Map<TSoundName, Howl> = new Map();
    private isMuted: boolean = false;
    private readonly LOW_VOLUME_SOUNDS: string[] = [
        "game_over",
        "game_loop"
    ];

    constructor() {
        this.initSounds();
    }

    private initSounds() {
        const basePath = soundManifest.basePath;
        const soundEntries = soundManifest.sounds;

        for (const soundName in soundEntries) {
            const volume = this.LOW_VOLUME_SOUNDS.includes(soundName) ? 0.15 : 0.6;
            const sound = new Howl({
                src: [`${basePath}${soundEntries[soundName as TSoundName]}`],
                volume: volume
            });
            this.sounds.set(soundName as TSoundName, sound);
        }
    }

    public play(name: TSoundName) {
        const sound = this.getSound(name);
        sound.loop(false);
        sound.play();
    }

    public playLoop(name: TSoundName) {
        const sound = this.getSound(name);
        sound.loop(true);
        if (!sound.playing()) {
            sound.play();
        }
    }

    public stopAll() {
        Howler.stop();
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        Howler.mute(this.isMuted);
        return this.isMuted;
    }

    public checkMuted() {
        return this.isMuted;
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