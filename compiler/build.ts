/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DevServer,
  ImportMapPlugin,
  Svelte,
  terser,
} from "../src/shared/internal_plugins.ts";
import { rollup, OutputOptions, RollupOptions } from "drollup";
import type { RollupBuildProps } from "./types.ts";

export async function RollupBuild({
  dir = "./public/dist",
  generate = "dom",
  plugins = [],
  production = false,
  cache = undefined,
  ipv4,
}: RollupBuildProps) {
  generate = generate === "ssg" || generate === "ssr" ? "ssr" : "dom";

  const defaults = production
    ? [
      ImportMapPlugin({
        maps: "./import_map.json",
      }),
      ...plugins,
      Svelte({ generate }),
      terser(),
    ]
    : [
      ImportMapPlugin({
        maps: "./import_map.json",
      }),
      ...plugins,
      (await DevServer(ipv4))!,
      Svelte({ generate, dev: true }),
      terser(),
    ] as any;

  const options: RollupOptions = {
    input: "svelte-entry",
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
