import { TimedKeyValueStore } from './timed-key-value-store';
import { TypedKeyValueStore } from './typed-key-value-store';

/**
 * Combines the methods of the TypedKeyValueStore and TimedKeyValueStore
 */
export type TimedTypedKeyValueStore<M extends { [key: string]: unknown }>
  = TypedKeyValueStore<M> & TimedKeyValueStore<string, M[string]>;
