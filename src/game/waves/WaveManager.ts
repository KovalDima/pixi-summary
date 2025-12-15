import { EntityManager } from "../EntityManager";
import { type TEnemyConfig } from "../entities/Enemy";

export enum WaveState {
    IDLE = "idle",
    SPAWNING = "spawning",
    WAITING = "waiting",
}

export class WaveManager {
    private readonly entityManager: EntityManager;
    private currentWave: number = 0;
    private state: WaveState = WaveState.IDLE;
    private enemiesToSpawn: number = 0;
    private spawnTimer: number = 0;
    private readonly spawnIntervalBase: number = 1.2;
    private spawnIntervalCurrent: number = 0;
    private timeToNextWave: number = 0;
    private readonly timeBetweenWavesBuffer = 10;

    public onWaveChange?: (wave: number) => void;
    public onWaveTimerUpdate?: (timeLeft: number) => void;
    public onStateChange?: (state: WaveState) => void;

    constructor(entityManager: EntityManager) {
        this.entityManager = entityManager;
    }

    public startNextWave() {
        if (this.state === WaveState.SPAWNING) {
            return;
        }

        this.initWave(this.currentWave + 1);
    }

    public update(delta: number) {
        const deltaSeconds = delta / 60;

        if (this.state === WaveState.SPAWNING) {
            this.handleSpawningState(deltaSeconds);
        } else if (this.state === WaveState.WAITING) {
            this.handleWaitingState(deltaSeconds);
        }
    }

    private initWave(waveIndex: number) {
        const spawnIntervalCoeff = 0.05;
        const firstSpawnCount = 5;
        const spawnEnemyCoeff = this.currentWave * 2;

        this.currentWave = waveIndex;
        this.state = WaveState.SPAWNING;
        this.enemiesToSpawn = firstSpawnCount + spawnEnemyCoeff;
        this.spawnIntervalCurrent = Math.max(0.8, this.spawnIntervalBase - (this.currentWave * spawnIntervalCoeff));
        this.spawnTimer = 0;

        const totalSpawnTime = this.enemiesToSpawn * this.spawnIntervalCurrent;
        this.timeToNextWave = totalSpawnTime + this.timeBetweenWavesBuffer;

        this.onWaveChange?.(this.currentWave);
        this.onStateChange?.(this.state);
    }

    private handleSpawningState(delta: number) {
        this.updateWaveTimer(delta);

        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0 && this.enemiesToSpawn > 0) {
            this.spawnEnemy();
            this.enemiesToSpawn--;
            this.spawnTimer = this.spawnIntervalCurrent;
        }

        if (this.enemiesToSpawn <= 0) {
            this.state = WaveState.WAITING;
            this.onStateChange?.(this.state);
        }
    }

    private handleWaitingState(delta: number) {
        this.updateWaveTimer(delta);

        const allEnemiesDead = this.entityManager.getEnemies().length === 0;

        if (allEnemiesDead) {
            this.state = WaveState.IDLE;
            this.timeToNextWave = 0;
            this.onWaveTimerUpdate?.(0);
            this.onStateChange?.(this.state);
        }

        if (this.timeToNextWave <= 0 && this.state !== WaveState.IDLE) {
            this.startNextWave();
        }
    }

    private updateWaveTimer(delta: number) {
        this.timeToNextWave -= delta;
        if (this.timeToNextWave < 0) {
            this.timeToNextWave = 0;
        }
        this.onWaveTimerUpdate?.(this.timeToNextWave);
    }

    private spawnEnemy() {
        // TODO: change
        // HP: База 15 + 20% кожну хвилю
        const hpMultiplier = Math.pow(1.2, this.currentWave - 1);
        const hp = Math.floor(15 * hpMultiplier);

        // TODO: change
        // Reward: 10 + 1
        const reward = 10 + this.currentWave;

        const config: TEnemyConfig = {
            hp,
            speed: 2,
            reward,
            damageToPlayer: 1
        };

        this.entityManager.spawnWaveEnemy(config);
    }
}