/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { join } from "path";

export async function createFile(name: string, path: string, source: string) {
  try {
    await Deno.writeTextFile(join(path, name), source);

    return true;
  } catch (error: unknown) {
    console.log(error);
  }
}

export async function createDir(name: string, path: string) {
  try {
    await Deno.mkdir(join(path, name));

    return true;
  } catch (error: unknown) {
    console.log(error);
  }
}
