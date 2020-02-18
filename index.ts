class SimulationStatus {
    constructor(public population: Person[],
                public initialResources: number,
                public resourcesGrowRate: number,
                public maxFarm: number,
                public maxMan: number,
                public birthRate: number){}

    simulate(maxTime: number) {
        let resources = this.initialResources;
        for(let time = 0; time < maxTime && this.population.length > 0; time++) {
            resources += Math.floor(this.resourcesGrowRate * Math.random());
            for(const person of this.population) {
                resources -= person.farm(resources, this.maxFarm);
                person.manufacture(this.maxMan);
            }
            auction(this.population, this.population);
            for(const person of this.population) {
                person.toAge();
                person.eat();
            }
            let lostMoney = this.population
                .filter(person => person.health <= 0)
                .reduce((acc, person) => acc + person.money, 0);
            this.population = this.population.filter(person => person.health > 0);
            let distributedMoney = lostMoney / this.population.length;
            this.population.forEach(person => person.money += distributedMoney);
            for(let person of this.population) {
                if(person.age > 18 * 365 && Math.random() < this.birthRate) {
                    this.population.push(new Person(PersonId++, Math.random(), person.money * 0.5));
                    person.money -= person.money * 0.5;
                }
            }
            if(time % 365 == 0) {
                console.log("Year:", time / 365);
                console.log("Resources:", resources);
                console.table(this.population.map(person => ({
                    "id": person.id,
                    "health": Math.ceil(person.health * 100),
                    "money": Math.ceil(person.money),
                    "raw": person.inventory.raw,
                    "cooked": person.inventory.cooked,
                    "age": Math.floor(person.age / 365),
                    "farm": Math.ceil(person.skills.farm * 100),
                    "man.": Math.ceil(person.skills.manufacture * 100),
                    "sell": Math.ceil(person.skills.sell * 100),
                    "price": Math.floor(person.buyPrice)
                })).sort((a, b) => a.id - b.id));
            }
        }
    }
}

class Skills {
    public farm: number;
    public manufacture: number
    public sell: number;
    constructor() {
        this.farm = Math.random();
        this.manufacture = Math.random();
        this.sell = Math.random();
    }
}

class Inventory {
    public raw: number;
    public cooked: number;
    constructor() {
        this.raw = 0;
        this.cooked = 0;
    }

    addRaw(value: number) {
        this.raw += value;
    }

    subRaw(value: number) {
        this.raw -= value;
    }

    addCooked(value: number) {
        this.cooked += value;
    }

    subCooked(value: number) {
        this.cooked -= value;
    }
}

class Person {
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
        return this.inventory.cooked > 0 ? this.health * this.money : Infinity;
    }

    get buyPrice() {
        return this.health * this.money;
    }

    farm(maxResources: number, maxFarm: number) {
        let value = Math.round(Math.min(maxResources, maxFarm * this.skills.farm * Math.random()));
        this.inventory.addRaw(value);
        return value;
    }

    manufacture(maxMan: number) {
        let value = Math.round(Math.min(this.inventory.raw, maxMan * this.skills.manufacture * Math.random()));
        this.inventory.subRaw(value);
        this.inventory.addCooked(value);
    }

    eat() {
        const maxFoodHealing = 0.2;
        while(this.inventory.cooked > 0) {
            let value = maxFoodHealing * Math.random()
            if(this.health + value > 1) return;
            this.health += value;
            this.inventory.cooked--;
        }
    }

    toAge() {
        const maxHealthDeprecation = 0.2;
        this.age++;
        let year = this.age / 365 + 1;
        this.health -= maxHealthDeprecation * (1 - (1/year)) * Math.random(); // age is >= 1
    }

    sell(price: number) {
        this.inventory.cooked--;
        this.money += price;
    }

    buy(price: number) {
        this.inventory.cooked++;
        this.money -= price;
    }
}

function auction(buyers: Person[], sellers: Person[]) {
   let sells = [];
   while(true) {
        let sellersSorted = sellers.sort((a, b) => b.skills.sell * Math.random() - a.skills.sell * Math.random());
        let buyersSorted = buyers.sort((a, b) => b.buyPrice - a.buyPrice);
        let [buyer, advBuyer] = buyersSorted;
        let price = advBuyer ? Math.min(buyer.buyPrice, advBuyer.buyPrice + Number.EPSILON) : Infinity;
        let seller = sellersSorted.find(seller => price >= seller.sellPrice && seller != buyer);
        if(seller) {
            if(price == Infinity && buyer.buyPrice > seller.sellPrice) {
                price = seller.sellPrice;
            }
            sells.push({
                "Seller": seller.id,
                "Buyer": buyer.id,
                "Seller's money": Math.ceil(seller.money),
                "Buyer's money": Math.ceil(buyer.money),
                "Price": Math.ceil(price),
                "Seller's price": Math.ceil(seller.sellPrice),
                "Buyer's price": Math.ceil(buyer.buyPrice)
            });
            seller.sell(price);
            buyer.buy(price);
            sellers = sellers.filter(seller => seller != buyer);
        } else {
            break;
        }
    }
    //console.table(sells);
}

interface Config {
    "population number": number,
    "initial resources": number,
    "resources grow rate": number,
    "max farming": number,
    "max manufacturing": number,
    "birth rate": number,
    "__proto__": Config | Object
}

var defaultConfig: Config = {
    "population number": 100,
    "initial resources": 100,
    "resources grow rate": 100,
    "max farming": 5,
    "max manufacturing": 5,
    "birth rate": 0.0001,
    "__proto__": {}
}

var config:Config = defaultConfig;
if(Deno.args[0]) {
    config = JSON.parse(String.fromCharCode.apply(null, Deno.readFileSync(Deno.args[0])));
    config.__proto__ = defaultConfig;
}

var population: Person[] = new Array(config["population number"]);
for(let i = 0; i < population.length; i++) {
    population[i] = new Person(i, Math.random(), 100);
}
var PersonId = config["population number"];
new SimulationStatus(population, config["initial resources"], config["resources grow rate"], config["max farming"] , config["max manufacturing"] , config["birth rate"]).simulate(Infinity);