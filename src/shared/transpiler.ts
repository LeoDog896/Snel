/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { toFileUrl } from "../../imports/path.ts";
import { colors } from "../../imports/fmt.ts";

export function stract(source: string) {
  const chunks = source.split("\n").map((chunk) => chunk.trim());

  const ends = (chunk: string) =>
    chunk.endsWith(".svelte'") ||
    chunk.endsWith(".svelte';") ||
    chunk.endsWith('.svelte"') ||
    chunk.endsWith('.svelte";');

  const start = (chunk: string) =>
    chunk.startsWith("import ") || chunk.startsWith("import");

  return {
    code: chunks.filter((chunk) => !(start(chunk) && ends(chunk))).join("\n"),
    imports: chunks.filter((chunk) => start(chunk) && ends(chunk)).join("\n"),
  };
}

export async function tsTranspiler(source: string, filename: string) {
  try {
    const { code, imports } = stract(source);

    const temp = await Deno.makeTempFile({ suffix: ".ts" });

    await Deno.writeFile(temp, new TextEncoder().encode(code));

    const { files } = await Deno.emit(toFileUrl(temp), { check: false });

    const key = Object.keys(files)
      .filter((key) => key.endsWith(".ts.js"))
      .shift()!;

    // merge compoenents imports and transpiled code
    return `${imports}\n${files[key]}`;
  } catch (error: any) {
    throw new Error(
      colors.yellow(
        `Transpiling typescript: ${
          colors.red(error.message) ?? ""
        } in component ${colors.yellow(filename)}`
      )
    ).message;
  }
}
