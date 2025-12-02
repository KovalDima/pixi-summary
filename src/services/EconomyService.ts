export class EconomyService {
    private readonly balance: number;

    constructor(initialBalance = 500) {
        this.balance = initialBalance;
    }

    public getBalance() {
        return this.balance;
    }
}