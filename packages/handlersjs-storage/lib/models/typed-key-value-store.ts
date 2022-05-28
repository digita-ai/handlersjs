import { KeyValueStore } from './key-value-store';

export interface TypedKeyValueStore<M extends { [key: string]: unknown }> extends KeyValueStore<string, M[string]> {

  /**
   * Returns the value stored for the given identifier.
   * `undefined` if no value is stored.
   *
   * @param key - Key to get the value for.
   *
   * @returns the value identified by the given key
   */
  get: <T extends string>(key: T) => Promise<M[T] | undefined>;

  /**
   * Checks if there is a value stored for the given key.
   *
   * @param key - Key to check.
   *
   * @returns whether the key is in the store
   */
  has: <T extends string>(key: T) => Promise<boolean>;

  /**
   * Sets the value for the given key.
   *
   * @param key - Key to set/update.
   * @param value - Value to store.
   *
   * @returns The storage.
   */
  set: <T extends string>(key: T, value: M[T]) => Promise<this>;

  /**
   * Deletes the value stored for the given key.
   *
   * @param key - Key to delete.
   *
   * @returns If there was a value to delete.
   */
  delete: <T extends string>(key: T) => Promise<boolean>;

  /**
   * An iterable of entries in the storage.
   *
   * @returns the asynchronous iterator
   */
  entries: () => AsyncIterableIterator<[string, M[string]]>;

}
