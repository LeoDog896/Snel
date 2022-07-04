/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DevServer,
  Svelte,
  terser,
} from "../src/shared/internal_plugins.ts";
import { rollup, OutputOptions, RollupOptions } from "drollup";
import type { RollupBuildProps } from "./types.ts";
import { svelteEntry } from "./svelteEntry.ts"

export async function RollupBuild({
  dir = "./public/dist",
  plugins = [],
  production = false,
  cache = undefined,
  ipv4,
  config
}: RollupBuildProps) {
  const defaults = production
    ? [
      ...plugins,
      svelteEntry(),
      Svelte(),
      terser(),
    ]
    : [
      ...plugins,
      DevServer(config!, ipv4)!,
      svelteEntry(),
      Svelte({ dev: true }),
      terser(),
    ] as any;

  const options: RollupOptions = {
    input: "\0svelte-entry",
    plugins: [...defaults],
    output: {
      dir,
      format: "es",
      sourcemap: !production,
    },
    cache,
    treeshake: production,
  };

  const bundle = await rollup(options);
  await bundle.write(options.output as OutputOptions);
  await bundle.close();

  return bundle;
}
