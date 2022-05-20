import { Handler } from '@digita-ai/handlersjs-core';
import { NodeHttpStreams } from './node-http-streams.model';

/**
 * Handles the IncomingMessage and ServerResponse of a { NodeHttpStreams } object.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export abstract class NodeHttpStreamsHandler extends Handler<NodeHttpStreams> {}
