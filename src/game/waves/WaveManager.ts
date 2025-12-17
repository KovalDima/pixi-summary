import { utils } from "pixi.js";
import { EntityManager } from "../EntityManager";
import { EnemyType, type TEnemyConfig } from "../entities/EnemyTypes";
import { EnemyRegistry } from "../entities/EnemyRegistry";

export enum WaveState {
    IDLE = "idle",
    SPAWNING = "spawning",
    WAITING = "waiting",
}

export class WaveManager extends utils.EventEmitter {
    private readonly entityManager: EntityManager;
    private currentWave: number = 0;
    private state: WaveState = WaveState.IDLE;
    private spawnQueue: EnemyType[] = [];
    private spawnTimer: number = 0;
    private readonly spawnIntervalBase: number = 1.5;
    private spawnIntervalCurrent: number = 0;
    private timeToNextWave: number = 0;
    private readonly timeBetweenWavesBuffer = 30;
    private totalEnemiesInWave: number = 0;
    private killedEnemiesInWave: number = 0;

    public onWaveChange?: (wave: number) => void;
    public onWaveTimerUpdate?: (timeLeft: number) => void;
    public onStateChange?: (state: WaveState) => void;

    constructor(entityManager: EntityManager) {
        super();
        this.entityManager = entityManager;
        this.entityManager.on("enemy_killed", () => this.onEnemyKilled());
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

    public onEnemyKilled() {
        this.killedEnemiesInWave++;
        this.emitProgress();
    }

    public getTimeToNextWave() {
        return this.timeToNextWave;
    }

    private initWave(waveIndex: number) {
        const spawnIntervalCoeff = 0.05;
        const firstSpawnCount = 5;
        const spawnEnemyCoeff = Math.floor(this.currentWave * 1.5);
        const totalCount = firstSpawnCount + spawnEnemyCoeff;
        let powerfulCount = 0;

        this.currentWave = waveIndex;
        this.state = WaveState.SPAWNING;
        this.totalEnemiesInWave = totalCount;
        this.killedEnemiesInWave = 0;
        this.spawnQueue = [];

        if (this.currentWave >= 5) {
            powerfulCount = Math.floor(Math.random() * 2) + 1;
        }

        const regularCount = totalCount - powerfulCount;

        for (let i = 0; i < regularCount; i++) {
            this.spawnQueue.push(EnemyType.REGULAR);
        }

        for (let i = 0; i < powerfulCount; i++) {
            this.spawnQueue.push(EnemyType.POWERFUL);
        }

        this.spawnQueue.sort(() => Math.random() - 0.5);

        this.emitProgress();
        this.spawnIntervalCurrent = Math.max(0.8, this.spawnIntervalBase - (this.currentWave * spawnIntervalCoeff));
        this.spawnTimer = 0;

        this.timeToNextWave = this.totalEnemiesInWave * 1.5 + this.timeBetweenWavesBuffer;

        this.onWaveChange?.(this.currentWave);
        this.onStateChange?.(this.state);
    }

    private emitProgress() {
        this.emit("wave_progress", {
            killed: this.killedEnemiesInWave,
            total: this.totalEnemiesInWave
        });
    }

    private handleSpawningState(delta: number) {
        this.updateWaveTimer(delta);

        this.spawnTimer -= delta;

        if (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
            this.spawnEnemy();
            this.spawnTimer = this.spawnIntervalCurrent;
        }

        if (this.spawnQueue.length <= 0) {
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
        const enemyType = this.spawnQueue.shift();
        if (!enemyType) {
            return;
        }

        const typeConfig = EnemyRegistry.getTypeConfig(enemyType);
        const baseHp = Math.floor(12 * Math.pow(1.2, this.currentWave));
        const baseReward = 10 + Math.floor(this.currentWave / 2);
        const finalHp = Math.floor(baseHp * typeConfig.hpMultiplier);
        const finalReward = Math.floor(baseReward * typeConfig.rewardMultiplier);

        const config: TEnemyConfig = {
            ...typeConfig,
            hp: finalHp,
            reward: finalReward,
            damageToPlayer: 1,
        };

        this.entityManager.spawnWaveEnemy(config);
    }
}