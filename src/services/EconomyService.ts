import { utils } from "pixi.js";

export class EconomyService extends utils.EventEmitter {
    private balance: number;
    private totalEarned: number;

    constructor(initialBalance = 500) {
        super();
        this.balance = initialBalance;
        this.totalEarned = 0;
    }

    public getBalance() {
        return this.balance;
    }

    public getTotalEarned() {
        return this.totalEarned;
    }

    public addMoney(amount: number) {
        this.balance += amount;
        this.totalEarned += amount;
        this.emit("balance_changed", this.balance);
    }

    public spendMoney(amount: number) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.emit("balance_changed", this.balance);
            return true;
        }
        return false;
    }
}