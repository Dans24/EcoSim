import Skills from "../EcoSim/Skills.ts";
import Inventory from "../EcoSim/Inventory.ts";

export default class Person {
    public skills: Skills;
    public health: number;
    public money: number;
    public inventory: Inventory;
    public age: number;
    constructor(public id: number, initialHealth: number, initialMoney: number) {
        this.skills = new Skills();
        this.health = initialHealth;
        this.money = initialMoney;
        this.inventory = new Inventory();
        this.age = 0;
    }

    get missingHealth(): number {
        return 1 - this.health;
    }

    get sellPrice() {
        return this.inventory.cooked > 0 ? this.missingHealth * this.money : Infinity;
    }

    get buyPrice() {
        return this.health * this.money;
    }

    farm(maxResources: number, maxFarm: number) {
        let value = Math.min(maxResources, maxFarm * this.skills.farm * Math.random());
        this.inventory.addRaw(value);
        return value;
    }

    manufacture(maxMan: number) {
        let value = Math.min(this.inventory.raw, maxMan * this.skills.manufacture * Math.random());
        this.inventory.subRaw(value);
        this.inventory.addCooked(value);
    }

    eat() {
        for(let i = 0; i < this.inventory.cooked; i++) {
            let value = Math.random()
            if(this.health + value > 1) return;
            this.health += Math.random();
        }
    }

    toAge() {
        this.age++;
        this.health -= (1 - (1/this.age)) * Math.random(); // age is >= 1
    }

    sell(price: number, buyer: Person) {
        this.inventory.cooked--;
        this.money += price;
    }

    buy(price: number, seller: Person) {
        this.inventory.cooked++;
        this.money -= price;
    }
}