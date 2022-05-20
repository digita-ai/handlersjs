import { Observable, of, throwError } from 'rxjs';
import { Handler } from '../handlers/handler';
import { Daemon } from '../models/daemon';

/**
 * Daemon that, when started, repeats a certain task on interval.
 */
export class Scheduler extends Daemon {

  private currentTimeout: NodeJS.Timeout | undefined;

  /**
   * Creates a { Scheduler }.
   *
   * @param { number } interval - The interval in between tasks.
   * @param { Handler<void, void> } task - The task to execute every interval.
   */
  constructor(
    private readonly interval: number,
    private readonly task: Handler<void, void>
  ) { super(); }

  /**
   * Starts the scheduler
   *
   * @returns itself
   */
  start(): Observable<Daemon> {

    if (this.currentTimeout) {

      return throwError(() => new Error('Scheduler was already running'));

    } else {

      this.currentTimeout = setInterval(() => this.task.handle(), this.interval);

      return of(this);

    }

  }

  /**
   * Stops the scheduler
   *
   * @returns itself
   */
  stop(): Observable<Daemon> {

    if (this.currentTimeout) {

      clearInterval(this.currentTimeout);
      this.currentTimeout = undefined;

      return of(this);

    } else {

      return throwError(() => new Error("Scheduler wasn't running"));

    }

  }

}
