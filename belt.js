import { randomComponent } from './utils.js';

export class Belt {
    constructor(BELT_SIZE) {
        this.components = [];

        // if A and B has less count (ideally either being 0) and finishedProduct has high then the algorithm is optimized and has good accuracy
        this.stats = {
            finishedProduct: 0,
            A: 0,
            B: 0,
            empty: 0,
        };
        for (let i = 0; i < BELT_SIZE; i++) {
            this.components.push(null);
        }
    }

    /**
     * Generate a new random component at random interval and push it to the start of the belt.
     */
    async move() {
        const component = await randomComponent();
        this.components.unshift(component);
        const discaredComponent = this.components.pop();

        !discaredComponent
            ? this.stats.empty++
            : discaredComponent === 'A'
            ? this.stats.A++
            : discaredComponent === 'B'
            ? this.stats.B++
            : discaredComponent === 'P'
            ? this.stats.finishedProduct++
            : null;
    }

    /**
     *
     * @param {*} index the position of the slot on the belt
     * @returns component removed from the belt
     */
    remove(index) {
        // replace the component with null
        return this.components.splice(index, 1, null);
    }

    /**
     *
     * @param {*} component a component that should be replaced at a position on the belt
     * @param {*} index the slot at which the component needs to be replaced on the belt
     */
    replace(component, index) {
        this.components[index] = component;
    }
}
