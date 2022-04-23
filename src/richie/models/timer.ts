import { Duration, getUnixTime, milliseconds } from 'date-fns';

export class Timer {
  private isFirstRun: boolean = true;
  private startTimeoutRef?: NodeJS.Timeout;
  private timerRef?: NodeJS.Timer;

  readonly id: number;

  startTimestamp: number;
  triggerEveryMs: number;

  constructor(
    id: number,
    triggerEvery: Duration | number,
    private callback: () => unknown
  ) {
    this.id = id;

    this.triggerEveryMs = typeof triggerEvery === 'number' ? triggerEvery : milliseconds(triggerEvery);

    const nowTimestamp = getUnixTime(new Date()) * 1000;

    // Now + any% of duration so that every timer doesn't fire off at the same time on bot start
    this.startTimestamp = nowTimestamp + this.triggerEveryMs * Math.random();
  }

  clear(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      delete this.timerRef;
    }

    if (this.startTimeoutRef) {
      clearTimeout(this.startTimeoutRef);
      delete this.startTimeoutRef;
    }
  }

  run(): void {
    if (this.startTimeoutRef || this.timerRef) {
      return;
    }

    if (this.isFirstRun) {
      this.timerRef = setInterval(this.callback, this.triggerEveryMs);

      return;
    }

    const nowTimestamp = getUnixTime(new Date()) * 1000;
    const startDelayMs = Math.min(0, this.startTimestamp - nowTimestamp);

    this.startTimeoutRef = setTimeout(() => {
      this.timerRef = setInterval(this.callback, this.triggerEveryMs);

      delete this.startTimeoutRef;
    }, startDelayMs);

    if (this.isFirstRun) {
      this.isFirstRun = false;
    }
  }

  setPeriod(triggerEvery: Duration): void {
    this.triggerEveryMs = milliseconds(triggerEvery);

    this.clear();
    this.run();
  }

}
