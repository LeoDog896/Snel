/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  gitIgnore,
  globalCss,
  Home,
  indexHtml,
  rootSvelte,
  buildScript,
  devScript
} from "./templates.ts";
import type { CreateProjectOptions } from "../shared/types.ts";
import { createDir, createFile } from "./io.ts";
import * as colors from "fmt/colors.ts";
import { join, toFileUrl } from "path"
import { URL_SVELTE_CDN, VERSION } from "../shared/version.ts";

export async function CreateProject(options: CreateProjectOptions) {
  const { projectName, workingFolder } = options;

  const startTime = Date.now();
  const projectRoot = workingFolder
    ? Deno.cwd()
    : `${Deno.cwd()}/${projectName}`;

  if (!workingFolder) await Deno.mkdir(projectRoot, { recursive: true });

  const tasks = {
    dev: "deno run --allow-env --allow-net --allow-read --allow-run --allow-write --unstable --import-map=import_map.json ./dev.ts",
    build: "deno run --allow-env --allow-net --allow-read --allow-run --allow-write --unstable --import-map=import_map.json ./build.ts",
    check: "deno lint && deno fmt"
  };

  const builder = {
    files: [
      {
        name: "index.html",
        path: `${projectRoot}/public`,
        source: indexHtml("/dist/main.js"),
      },
      {
        name: "global.css",
        path: `${projectRoot}/public`,
        source: globalCss,
      },
      {
        name: "import_map.json",
        path: projectRoot,
        source: JSON.stringify({
          imports: {
            "snel/": `https://deno.land/x/snel@v${VERSION}/`,
            snel: `https://deno.land/x/snel@v${VERSION}/mod.ts`,
            "snel/core/": `https://deno.land/x/snel@v${VERSION}/core/`,
            "snel/utils/": `https://deno.land/x/snel@v${VERSION}/core/utils/`,
            "snel/utils": `https://deno.land/x/snel@v${VERSION}/core/utils/mod.ts`,
            svelte: URL_SVELTE_CDN,
            "svelte/": `${URL_SVELTE_CDN}/`,
            "@/": "./",
            "~/": `${toFileUrl(join(projectRoot, "src")).href}/`,
            "$/": `${toFileUrl(projectRoot).href}/`,
          }
        }, null, 2)
      },
      {
        name: "build.ts",
        path: projectRoot,
        source: buildScript
      },
      {
        name: "dev.ts",
        path: projectRoot,
        source: devScript
      },
      {
        name: `App.svelte`,
        path: `${projectRoot}/src/`,
        source: rootSvelte,
      },
      {
        name: "Home.svelte",
        path: `${projectRoot}/src/components`,
        source: Home
      },
      {
        name: ".gitignore",
        path: projectRoot,
        source: gitIgnore("dist"),
      },
      {
        name: "deno.json",
        path: projectRoot,
        source: JSON.stringify(
          {
            tasks,
            files: ["./src", "./public/index.html", "./public/global.css"]
          },
          null,
          2,
        ),
      }
    ],
    dirs: [
      {
        name: "src",
        path: projectRoot,
      },
      {
        name: "components",
        path: `${projectRoot}/src`,
      },
    ]
  };

  for (const dir of builder.dirs) {
    const { name, path } = dir;
    await createDir(name, path);
  }

  for (const file of builder.files) {
    const { name, path, source } = file;
    await createFile(name, path, source);
  }

  const endTime = Date.now();

  console.clear();
  console.log(`
  Done in ${(endTime - startTime) / 1000}s.

  Success! Created ${projectName} at ${join(Deno.cwd(), projectName)}
  Inside that directory, you can run several commands:

    ${colors.blue("deno task dev")} (experimental hot reloading)
      Starts the development server.

    ${colors.blue("deno task build")}
      Bundles the app into static files for production.
    
    ${colors.blue("deno task check")}
      Lint and format the project.

  We suggest that you begin by typing:
    ${workingFolder ? `` : `\n    ${colors.blue("cd")} ${projectName}`}
    ${colors.blue("deno task dev")}
  `);
}
