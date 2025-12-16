import { Container, Texture } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import { ParticleSparkConfig } from "./ParticleSparkConfig";

export class ParticleService {
    private emitters: Emitter[] = [];

    public createSparkEmitter(parent: Container) {
        const emitter = new Emitter(parent, ParticleSparkConfig.config);
        this.emitters.push(emitter);
        return emitter;
    }

    public update(delta: number) {
        const deltaSeconds = delta / 60;
        this.emitters.forEach(emitter => emitter.update(deltaSeconds));
    }

    public removeEmitter(emitter: Emitter) {
        emitter.destroy();
        const index = this.emitters.indexOf(emitter);
        if (index !== -1) {
            this.emitters.splice(index, 1);
        }
    }
}