import { Plugin } from "drollup";

export function svelteEntry(): Plugin {
  return <Plugin>{
    name: 'svelte-entry',
    resolveId(source) {
      if (source === 'svelte-entry') {
        return source;
      }
      return null;
    },
    load(id) {
      if (id === 'virtual-module') {
        return `import App from "./App.svelte";

new App({
  target: document.body,
  hydrate: true,
  props: {},
});
`;
      }
      return null;
    }
  };
}