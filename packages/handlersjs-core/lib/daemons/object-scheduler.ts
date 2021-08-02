import { Scheduler } from './scheduler';

/**
 * Scheduler that takes an object & method name instead of a task, created for ComponentJs compatibility
 */
export class ObjectScheduler<N extends string, T extends { [n in N]: () => unknown }> extends Scheduler {

  /**
   * An object-scheduler is a daemon that, when started, executes a given task on-repeat, defined by an object and a method name
   *
   * @param interval the interval inbetween tasks
   * @param object an object containing the task
   * @param method the name of the method
   */
  constructor(
    interval: number,
    object: T,
    method: N
  ) {

    super(interval, () => object[method]());

  }

}
