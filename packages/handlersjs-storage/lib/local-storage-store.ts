import { TypedKeyValueStore } from './models/typed-key-value-store';

/**
 * A {@link TypedKeyValueStore} which uses a JavaScript Map for internal storage.
 *
 * @inheritdoc
 */
export class LocalStorageStore<M extends { [key: string]: unknown }> implements TypedKeyValueStore<M> {

  constructor() {

    if (!localStorage.getItem('localStorageStore')) localStorage.setItem('localStorageStore', JSON.stringify({}));

  }

  async get<T extends string>(key: T): Promise<M[T] | undefined> {

    const localStorageStoreString = localStorage.getItem('localStorageStore');

    const localStorageStore = localStorageStoreString ? JSON.parse(localStorageStoreString) : undefined;

    return localStorageStore ? localStorageStore[key] : undefined;

  }

  async has<T extends string>(key: T): Promise<boolean> {

    const localStorageStoreString = localStorage.getItem('localStorageStore');

    const localStorageStore = localStorageStoreString ? JSON.parse(localStorageStoreString) : undefined;

    return localStorageStore ? localStorageStore[key] !== undefined : false;

  }

  async set<T extends string>(key: T, value: M[T]): Promise<this> {

    const localStorageStoreString = localStorage.getItem('localStorageStore');

    const localStorageStore = localStorageStoreString ? JSON.parse(localStorageStoreString) : undefined;

    localStorageStore[key] = value;

    localStorage.setItem('localStorageStore', JSON.stringify(localStorageStore));

    return this;

  }

  async delete<T extends string>(key: T): Promise<boolean> {

    const localStorageStoreString = localStorage.getItem('localStorageStore');

    const localStorageStore = localStorageStoreString ? JSON.parse(localStorageStoreString) : undefined;

    localStorageStore[key] = undefined;

    localStorage.setItem('localStorageStore', JSON.stringify(localStorageStore));

    return this.has(key);

  }

  // eslint-disable-next-line require-yield
  async* entries(): AsyncIterableIterator<[string, M[string]]> {

    throw new Error('Not Implemented');

  }

}
