import Person from "./Person.ts";
export default class SimulationStatus {
    constructor(public population: Person[],
                public initialResources: number,
                public maxFarm: number,
                public maxMan: number){}

    simulate(maxTime: number) {
        let resources = this.initialResources;
        for(let time = 0; time < maxTime && this.population.length > 0; time++) {
            for(const person of this.population) {
                resources -= person.farm(resources, this.maxFarm);
                person.manufacture(this.maxMan);
            }
            auction(this.population, this.population);
            for(const person of this.population) {
                person.toAge();
                person.eat();
            }
        }
    }
}

function auction(buyers: Person[], sellers: Person[]) {
    while(true) {
         let sellersSorted = sellers.sort((a, b) => b.skills.sell * Math.random() - a.skills.sell * Math.random());
         let buyersSorted = buyers.sort((a, b) => b.buyPrice - a.buyPrice);
         let [buyer, advBuyer] = buyersSorted;
         let price = Math.min(buyer.buyPrice, advBuyer.buyPrice + 1);
         let seller = sellersSorted.find(seller => price >= seller.sellPrice);
         if(seller) {
             seller.sell(price, buyer);
             buyer.buy(price, seller);
             console.log(price);
         } else {
             break;
         }
     }
 }