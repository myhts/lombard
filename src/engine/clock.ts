export type Clock = { now(): number }; // milliseconds

// performance.now() is monotonic, so a change to the system time can't make a latency negative; Date.now() isn't.
export const systemClock: Clock = { now: () => performance.now() };
