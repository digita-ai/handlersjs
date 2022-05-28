
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { JsonFileStore } from './json-file-store';

describe('JsonFileStore', () => {

  interface TestInterface {
    key1: number;
    key2: string;
    key3: boolean;
    key4: string[];
    key5: Record<string, string>;
    [key: string]: unknown;
  }

  const path = join(__dirname, '../../test/store.json');

  let store: JsonFileStore<TestInterface>;

  beforeEach(() => {

    store = new JsonFileStore(path);

  });

  afterEach(async () => {

    await fsPromises.rm(path, { force: true });

  });

  afterAll(async () => {

    await fsPromises.writeFile(path, `{ "": "This is a placeholder file for the JsonFileStore tests." }`, 'utf8');

  });

  it('can be initialized', async () => {

    store = new JsonFileStore('test/store.json');

    await expect(store).toBeTruthy();

  });

  describe('get()', () => {

    it('should get a value that has been set', async () => {

      await store.set('key1', 5);
      await store.set('key2', 'test');

      await expect(store.get('key1')).resolves.toEqual(5);
      await expect(store.get('key2')).resolves.toEqual('test');

    });

    it('can not get a value that has not been set', async () => {

      await expect(store.get('key1')).resolves.toBeUndefined();

    });

  });

  describe('set()', () => {

    it('can set a key', async () => {

      await store.set('key1', 5);
      await expect(store.get('key1')).resolves.toEqual(5);

    });

    it('can overwrite an existing key', async () => {

      await store.set('key1', 5);
      await store.set('key1', 8);
      await expect(store.get('key1')).resolves.toEqual(8);

    });

  });

  describe('has()', () => {

    it('should not have keys that were not added', async () => {

      await expect(store.has('key1')).resolves.toBe(false);
      // implies ->
      await expect(store.get('key1')).resolves.toBeUndefined();
      // await expect(store.latestUpdate('key1')).resolves.toBeUndefined();
      // await expect(store.hasUpdate('key1', Date.now())).resolves.toBeUndefined();

    });

    it('should have keys that were added', async () => {

      await store.set('key1', 5);
      await expect(store.has('key1')).resolves.toBe(true);
      // implies ->
      await expect(store.get('key1')).resolves.toBeDefined();
      // await expect(store.latestUpdate('key1')).resolves.toBeDefined();
      // await expect(store.hasUpdate('key1', Date.now())).resolves.toBeDefined();

    });

  });

  describe('delete()', () => {

    it('should not contain a deleted key', async () => {

      await store.set('key2', 'test');
      await expect(store.get('key2')).resolves.toEqual('test');
      await expect(store.delete('key2')).resolves.toBe(true);

      await expect(store.has('key2')).resolves.toBe(false);
      await expect(store.get('key2')).resolves.toBeUndefined();

    });

    it('can add an item again after deletion', async () => {

      await store.set('key2', 'test');
      await expect(store.get('key2')).resolves.toEqual('test');
      await expect(store.delete('key2')).resolves.toBe(true);

      await store.set('key2', 'test2');

      await expect(store.has('key2')).resolves.toBe(true);
      await expect(store.get('key2')).resolves.toEqual('test2');

    });

    it('can not delete a value twice', async () => {

      await store.set('key2', 'test');
      await expect(store.delete('key2')).resolves.toBe(true);
      await expect(store.delete('key2')).resolves.toBe(false);

    });

  });

  describe('entries()', () => {

    it('should not iterate over keys pairs when it is empty', async () => {

      store.entries().next().then((result) => {

        expect(result.done).toBe(true);

      });

    });

    it('should iterate over added key-value pairs', async () => {

      const allValues: [string, TestInterface[keyof TestInterface]][] = [
        [ 'key1', 4 ],
        [ 'key2', '123' ],
        [ 'key4', [ '', '', '321' ] ],
      ];

      const allValuesMap: Map<string, TestInterface[keyof TestInterface]> = new Map(allValues);

      for await (const [ key, value ] of allValuesMap.entries()) { await store.set(key, value); }

      for await (const [ key, value ] of store.entries()) {

        await expect(value).toEqual(allValuesMap.get(key));
        allValuesMap.delete(key);

      }

      expect(allValuesMap.size).toBe(0);

    });

  });

  // describe('latestUpdate()', () => {

  //   it('should know when the item was updated', async () => {

  //     const beforeSetTime = Date.now() - 1;
  //     await store.set('key1', 8);
  //     const setTime = await store.latestUpdate('key1');
  //     const afterSetTime = Date.now() + 1;

  //     expect(beforeSetTime < setTime && setTime < afterSetTime).toBe(true);

  //   });

  // });

  // describe('hasUpdate()', () => {

  //   it('should tell you if there was an update', async () => {

  //     const beforeSetTime = Date.now() - 1;
  //     await store.set('key1', 8);
  //     const afterSetTime = Date.now() + 1;

  //     await expect(store.hasUpdate('key1', beforeSetTime)).resolves.toBe(true);
  //     await expect(store.hasUpdate('key1', afterSetTime)).resolves.toBe(false);

  //   });

  // });

});
