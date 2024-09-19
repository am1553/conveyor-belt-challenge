import { Belt } from './belt.js';
import { Worker } from './worker.js';

const SIMULATION_STEPS = 100;
const PAIRED_WORKERS = 3;
const BELT_SIZE = 5;
// can control how fast the promise is resolved for returning a component at random interval
export const INTERVAL_TIME_MULTIPLIER = 100;

async function runSimulation() {
    /**
     * TODO:
     * 1) Initialize belt and workers
     * 2) Start a loop based on steps to place component onto the belt
     * 3) Start a inner loop so each worker can check its relative position on the belt for a componet and interact
     * 4) Calculate the stats when the loop ends for A, B, empty slot and finished product
     */

    const belt = new Belt(BELT_SIZE);
    const workersGroup = [];

    // init workers
    for (let i = 0; i < PAIRED_WORKERS; i++) {
        workersGroup.push([new Worker(), new Worker()]);
    }

    // simulation loop
    for (let step = 0; step < SIMULATION_STEPS; step++) {
        // random component at random interval comes onto the belt, belt slot moves by 1 index
        console.log(`======== STEP ${step} ========`);
        await belt.move();

        // workers loop to check a fixed position where a slot moves to at every step loop

        for (let i = 0; i < PAIRED_WORKERS; i++) {
            const componentOnSlot = belt.components[i];
            const firstWorker = workersGroup[i][0];
            const secondWorker = workersGroup[i][1];
            console.log('GROUP: ', i);
            console.log('COMPONENT ON SLOT: ', componentOnSlot);
            if (componentOnSlot && componentOnSlot !== 'P') {
                handleComponentOnSlot(
                    i,
                    componentOnSlot,
                    firstWorker,
                    secondWorker,
                    belt
                );
            } else {
                // check if either worker has a finished product to be put on empty slot
                handleEmptySlot(i, firstWorker, secondWorker, belt);
            }
            console.log(workersGroup[i]);
        }
    }

    const remainingComponentsWithWorkers = {
        A: 0,
        B: 0,
        finishedProduct: 0,
        empty: 0,
    };

    for (let i = 0; i < PAIRED_WORKERS; i++) {
        const firstWorker = workersGroup[i][0];
        const secondWorker = workersGroup[i][1];

        firstWorker.holding.forEach((component) => {
            if (component === 'A') {
                remainingComponentsWithWorkers.A++;
            } else if (component === 'B') {
                remainingComponentsWithWorkers.B++;
            } else if (component === 'P') {
                remainingComponentsWithWorkers.finishedProduct++;
            } else {
                remainingComponentsWithWorkers.empty++;
            }
        });
        secondWorker.holding.forEach((component) => {
            if (component === 'A') {
                remainingComponentsWithWorkers.A++;
            } else if (component === 'B') {
                remainingComponentsWithWorkers.B++;
            } else if (component === 'P') {
                remainingComponentsWithWorkers.finishedProduct++;
            } else {
                remainingComponentsWithWorkers.empty++;
            }
        });
    }

    const stats = {
        finishedProduct:
            belt.stats.finishedProduct +
            remainingComponentsWithWorkers.finishedProduct,
        A: belt.stats.A + remainingComponentsWithWorkers.A,
        B: belt.stats.B + remainingComponentsWithWorkers.B,
        empty: belt.stats.empty + remainingComponentsWithWorkers.empty,
    };

    console.log(`=========================`);
    console.log(`======== OUTCOME ======== \n`);

    console.log(
        `${stats.finishedProduct} products were finished in ${SIMULATION_STEPS} steps.`
    );
    console.log(
        `A was skipped ${stats.A} times, B was skipped ${stats.B} and there were ${stats.empty} empty slots. \n`
    );
    console.log(stats);
}

function handleComponentOnSlot(
    i,
    componentOnSlot,
    firstWorker,
    secondWorker,
    belt
) {
    /**
     * TODO:
     * 1) If firstWorker has finishedProduct then replace
     * 2) If secondWorker has finishedProduct then replace
     * 3) If firstWorker requires it then firstWorker picks it up
     * 4) If secondWorker requires it then secondWorker picks it up
     * 5) If firstWorker has empty space hten firstWorker picks it up
     * 6) If secondWorker has empty space then secondWorker picks it up
     * 7) If neither can pick up then pass onto the next group
     */

    // allow only one action per slot change
    let disable = false;

    // If firstWorker has finishedProduct then replace
    if (!disable && firstWorker.finishedProduct()) {
        firstWorker.replace('P', belt, i);
        console.log('FIRST WORKER HAS REPLACED WITH FINISHED PRODUCT');
        disable = true;
    }

    // If secondWorker has finishedProduct then replace
    if (!disable && secondWorker.finishedProduct()) {
        secondWorker.replace('P', belt, i);
        console.log('SECOND WORKER HAS REPLACED WITH FINISHED PRODUCT');
        disable = true;
    }

    // If firstWorker requires it then firstWorker picks it up
    if (!disable && firstWorker.required === componentOnSlot) {
        firstWorker.pick(componentOnSlot, belt, i);
        console.log('FIRST WORKER REQUIRES IT SO PICKED IT');
        disable = true;
    }

    // If secondWorker requires it then secondWorker picks it up
    if (!disable && secondWorker.required === componentOnSlot) {
        secondWorker.pick(componentOnSlot, belt, i);
        console.log('SECOND WORKER REQUIRES IT SO PICKED IT');
        disable = true;
    }

    // If firstWorker has empty space then firstWorker picks it up only if the worker doesnt already have the same component
    if (
        !disable &&
        firstWorker.isEmpty() &&
        !firstWorker.holding.includes(componentOnSlot)
    ) {
        firstWorker.pick(componentOnSlot, belt, i);
        console.log('FIRST WORKER HAS EMPTY SPACE AND WONT DUPLICATE');
        disable = true;
    }

    // If secondWorker has empty space then secondWorker picks it up only if the worker doesnt already have the same component
    if (
        !disable &&
        secondWorker.isEmpty() &&
        !secondWorker.holding.includes(componentOnSlot)
    ) {
        secondWorker.pick(componentOnSlot, belt, i);
        console.log('SECOND WORKER HAS EMPTY SPACE AND WONT DUPLICATE');
        disable = true;
    }
}

function handleEmptySlot(i, firstWorker, secondWorker, belt) {
    /**
     * TODO:
     * 1) If firstWorker has finished product then place it on the slot else if secondWorker has finished product then place it on the slot.
     */

    if (firstWorker.finishedProduct()) {
        belt.components[i] = 'P';
    } else if (secondWorker.finishedProduct()) {
        belt.components[i] = 'P';
    }
}

await runSimulation();
