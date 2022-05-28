/**
 * MIT License
 *
 * Copyright (c) 2020 Solid Community
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { promises as fsPromises } from 'fs';
import { dirname, isAbsolute, join } from 'path';
import clone from 'clone';
import { TypedKeyValueStore } from './models/typed-key-value-store';

/**
 * Uses a JSON file to store key/value pairs.
 */
export class JsonFileStore<M extends Record<string, any>> implements TypedKeyValueStore<M> {

  private path: string;

  constructor(path: string) {

    this.path = isAbsolute(path) ? path : join(process.cwd(), path);

  }

  async get<T extends string>(key: T): Promise<M[T] | undefined> {

    const json = await this.getJson();

    return json[key];

  }

  async has<T extends string>(key: T): Promise<boolean> {

    const json = await this.getJson();

    return typeof json[key] !== 'undefined';

  }

  async set<T extends string>(key: T, value: M[T]): Promise<this> {

    return await this.updateJson((json: M): this => {

      json[key] = value;

      return this;

    })();

  }

  async delete<T extends string>(key: T): Promise<boolean> {

    return await this.updateJson((json: M): boolean => {

      if (typeof json[key] !== 'undefined') {

        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete json[key];

        return true;

      }

      return false;

    })();

  }

  async* entries(): AsyncIterableIterator<[string, M[string]]> {

    const json = await this.getJson();

    for (const [ key, value ] of Object.entries(json)) {

      yield [ key, clone(value) ];

    }

  }

  /**
   * Updates the data in the JSON file.
   *
   * @param updateFn - A function that updates the JSON object.
   *
   * @returns The return value of `updateFn`.
   */
  private updateJson<T>(updateFn: (json: M) => T): () => Promise<T> {

    return async () => {

      const json = await this.getJson();
      const result = updateFn(json);
      const updatedText = JSON.stringify(json, null, 2);
      await fsPromises.mkdir(dirname(this.path), { recursive: true });
      await fsPromises.writeFile(this.path, updatedText, 'utf8');

      return result;

    };

  }

  /**
   * Reads and parses the data from the JSON file (without locking).
   */
  private async getJson(): Promise<M> {

    try {

      const text = await fsPromises.readFile(this.path, 'utf8');

      return JSON.parse(text);

    } catch (error: any) {

      if (error && error.syscall && error.code && error.code === 'ENOENT') { return {} as M; }

      throw error;

    }

  }

}
