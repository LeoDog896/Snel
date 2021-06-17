/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { HtmlBodyProps } from "./types.ts";
import { VERSION } from "../shared/version.ts";

export function htmlBody({
  css = "",
  html = "",
  head = "",
  client = null,
  hotReloading = null
}: HtmlBodyProps) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${hotReloading ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/plugins/normalize-whitespace/prism-normalize-whitespace.min.js"></script>` : ""}
      ${head}
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      } ${css}
    </style>
    ${client ? `<script defer src="${client}"></script>` : ""}
  </head>
  <body>
    ${html}
    ${hotReloading ? hotReloading : ""}
  </body>
</html>`;
}

export const ssgMain = `<script>
  import Home from "@/components/Home.svelte";
  import { Core } from "snel";

  export let Request = {};

  const { MatchRoute } = Core;
</script>

{#if MatchRoute("/", Request?.PathName)}
  <Home name={"World"} />
{:else}
  <main>
    <h1>404 not found</h1>
  </main>
{/if}

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
`;

export const ssgHome = `<script>
  export let name;
</script>

<main>
  <h1>Hello {name}!</h1>
  <p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
`;

export const serverTemplate = (
  source: string,
  path: string,
  clientPath: string | null | undefined,
  mode: "ssr" | "ssg",
  port = 3000
) => {
  //TODO(buttercubz) change this en the next release
  return `
import { VERSION } from "https://deno.land/x/snel@v${VERSION}/src/shared/version.ts";
import { htmlBody } from "https://deno.land/x/snel@v${VERSION}/src/server_side/templates.ts";
import { join, toFileUrl } from "https://deno.land/std@0.99.0/path/mod.ts";
import { Application } from "https://deno.land/x/oak@v7.5.0/mod.ts";

${source}

await Server({
  path: "${path}",
  clientPath: ${mode === "ssr" ? `"${clientPath}"` : null},
  mode: "${mode}",
  port: ${Number(port)},
  dist: true
});
`;
};
