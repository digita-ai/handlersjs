import { Observable } from 'rxjs';

/**
 * This class represents typically long-running daemon processes that can be started and stopped.
 */
export abstract class Daemon {

  /**
   * @override
   * @inheritdoc Handlers.Daemon#start
   */
  abstract start(): Observable<Daemon>;

  /**
   * @override
   * @inheritdoc Handlers.Daemon#stop
   */
  abstract stop(): Observable<Daemon>;

}
