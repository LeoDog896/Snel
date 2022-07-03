/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//@ts-ignore
import {
  compile as svelteCompile,
  parse as svelteParse,
  preprocess as sveltePreprocess,
  VERSION,
  walk as svelteWalk,
} from "compiler"

import type { compileOptions, compileOut, PreprocessorGroup } from "./types.ts";

export function compile(source: string, options: compileOptions) {
  try {
    return svelteCompile(source, options as any) as unknown as compileOut;
  } catch (error) {
    // throw error data
    const { name, start, end, pos, filename, frame, stack, message } = error;

    throw {
      message,
      stack,
      file: filename,
      errorName: name,
      start,
      end,
      pos,
      frame,
    };
  }
}

export function preprocess(
  source: string,
  preprocessor: PreprocessorGroup | PreprocessorGroup[],
  options?: { filename?: string },
) {
  return sveltePreprocess(source, preprocessor as any, options);
}

export function parse(template: string, options?: ParserOptions | undefined) {
  return svelteParse(template, options);
}

export function walk(ast: any, handler: any) {
  return svelteWalk(ast, handler);
}

export { VERSION };
