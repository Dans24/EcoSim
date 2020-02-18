export default class Skills {
    public farm: number;
    public manufacture: number
    public sell: number;
    constructor() {
        this.farm = Math.random();
        this.manufacture = Math.random();
        this.sell = Math.random();
    }
}