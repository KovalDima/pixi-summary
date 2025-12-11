export class EconomyService {
    private balance: number;

    constructor(initialBalance = 500) {
        this.balance = initialBalance;
    }

    public getBalance() {
        return this.balance;
    }

    public addMoney(amount: number) {
        this.balance += amount;
        console.log(this.balance);
    }

    public spendMoney(amount: number) {
        if (this.balance >= amount) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
}