import type { DressedConfig } from "@dressed/framework";
import { type Params, patternToRegex } from "@dressed/matcher";
import { type ComponentInteraction, patchInteraction } from "@dressed/react";
import { createCallbackHandler, pattern } from "@dressed/react/callbacks";

const callbackHandler = createCallbackHandler({
  default(i: ComponentInteraction) {
    return i.reply("That handler has expired", { ephemeral: true });
  },
});

export default {
  build: { include: ["**/*.{ts,tsx}"] },
  hooks: {
    onBeforeCommand: (i) => [patchInteraction(i)],
    onBeforeComponent: (i, ...p) => [patchInteraction(i), ...p],
    onUnknownInteraction(i) {
      if (i.type !== 3 && i.type !== 5) return console.error("Unknown interaction", i);
      const args = patternToRegex(pattern).exec(i.data.custom_id)?.groups as Params<typeof pattern>;
      return callbackHandler(i as Parameters<typeof callbackHandler>[0], args);
    },
  },
} satisfies DressedConfig;
