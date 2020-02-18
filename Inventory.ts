export default class Inventory {
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