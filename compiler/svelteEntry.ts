import { Plugin } from "drollup";

export function svelteEntry(): Plugin {
  return <Plugin> {
    name: "\0svelte-entry",
    resolveId(source) {
      if (source === "\0svelte-entry") {
        return source;
      }
      return null;
    },
    load(id) {
      if (id === "\0svelte-entry") {
        return `import App from "./src/App.svelte";

new App({
  target: document.body,
  hydrate: true,
  props: {},
});
`;
      }
      return null;
    },
  };
}
