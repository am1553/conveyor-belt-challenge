/**
 * @description This class will represent a worker with two hands each can hold a component.
 * Everytime the worker picks or replaces a component from a belt, it updates the state of required to keep a track of the missing component to finish the product.
 */

export class Worker {
    constructor() {
        /**
         * An array representing left and right hand of a worker
         */
        this.holding = [];
        this.required = null;
    }

    isAllEmpty() {
        return (
            !this.holding.includes('A') &&
            !this.holding.includes('B') &&
            !this.holding.includes('P')
        );
    }

    /**
     *
     * @returns a boolean value for if a worker has an empty hand
     */
    isEmpty() {
        return this.holding.length < 2 || this.holding.includes(null);
    }

    /**
     * Check the holding and calculate which component is required to finish the product
     */
    checkRequired() {
        if (this.holding.includes('A') && this.holding.includes('B')) {
            this.assemble();
        } else {
            if (this.holding.includes('A')) {
                this.required = 'B';
            } else if (this.holding.includes('B')) {
                this.required = 'A';
            } else {
                this.required = null;
            }
        }
    }

    /**
     *
     * @param {*} component either A or B component picked up from the belt
     * @param {*} belt the instance of Belt class
     * @param {*} slotIndex the index (slot) of the array (belt) to track the position of the component
     */
    pick(component, belt, slotIndex) {
        // take component on empty hand
        if (!this.holding[0] && component) {
            this.holding[0] = component;
            belt.remove(slotIndex);
        } else if (!this.holding[1] && component) {
            this.holding[1] = component;
            belt.remove(slotIndex);
        }

        this.checkRequired();
    }

    /**
     *
     * @param {*} toReplaceComponent a new component that can be picked from the belt
     * @param {*} belt the instance of Belt class
     * @param {*} slotIndex the index (slot) of the array (belt) to track the position of the component
     */
    replace(toReplaceComponent, belt, slotIndex) {
        if (this.holding.includes(toReplaceComponent)) {
            if (this.holding[0] === toReplaceComponent) {
                this.holding[0] = belt.components[slotIndex];
                belt.replace(toReplaceComponent, slotIndex);
            }
            if (this.holding[1] === toReplaceComponent) {
                this.holding[1] = belt.components[slotIndex];
                belt.replace(toReplaceComponent, slotIndex);
            }
        }

        this.checkRequired();
    }

    /**
     * Assemble two components if they arent the same and it's not P
     */
    assemble() {
        this.holding = [null, 'P'];
    }

    /**
     *
     * @returns a boolean value based on whether a worker has a finished product
     */
    finishedProduct() {
        return this.holding.includes('P');
    }
}
