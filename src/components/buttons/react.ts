import type { MessageComponentInteraction } from "@dressed/react";
import { createCallbackHandler } from "@dressed/react/callbacks";

const buttonCallbackHandler = createCallbackHandler({
  default(i: MessageComponentInteraction) {
    return i.reply("That handler has expired", { ephemeral: true });
  },
});

export { pattern } from "@dressed/react/callbacks";
export default buttonCallbackHandler;
