import {Texture} from "pixi.js";

export class ParticleSparkConfig {
    public static readonly config = {
        lifetime: { min: 0.1, max: 0.5 },
        frequency: 0.008,
        spawnChance: 1,
        particlesPerWave: 1,
        emitterLifetime: -1,
        maxParticles: 100,
        pos: { x: 0, y: 0 },
        addAtBack: false,
        behaviors: [
            {
                type: "alpha",
                config: { alpha: { list: [{ value: 1, time: 0 }, { value: 0, time: 1 }] } }
            },
            {
                type: "scale",
                config: { scale: { list: [{ value: 0.5, time: 0 }, { value: 0.1, time: 1 }] } }
            },
            {
                type: "color",
                config: { color: { list: [{ value: "#ffc400", time: 0 }, { value: "#ffa600", time: 1 }] } }
            },
            {
                type: "moveSpeed",
                config: { speed: { list: [{ value: 200, time: 0 }, { value: 50, time: 1 }] } }
            },
            {
                type: "rotation",
                config: { accel: 0, minSpeed: 0, maxSpeed: 200, minStart: 0, maxStart: 360 }
            },
            {
                type: "textureSingle",
                config: { texture: Texture.WHITE }
            }
        ],
    };
}