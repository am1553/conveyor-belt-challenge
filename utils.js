import { INTERVAL_TIME_DIVISOR } from './index.js';

/**
 *
 * @returns a promise that whe fulfilled returns a random component at random interval
 */
export const randomComponent = () => {
    const rand = Math.random();
    const interval = Math.random() * INTERVAL_TIME_DIVISOR;

    return new Promise((resolve) => {
        const component = rand < 1 / 3 ? 'A' : rand < 2 / 3 ? 'B' : null;

        setTimeout(() => {
            resolve(component);
        }, interval);
    });
};
