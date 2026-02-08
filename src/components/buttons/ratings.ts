// deno-lint-ignore no-import-prefix
import { MessageFlags } from "npm:discord-api-types@^0.37.104/v10";
import type { MessageComponentInteraction } from "@inbestigator/discord-http";
import { fetchBook } from "../../api.ts";
import { sessions } from "../../commands/book.ts";

export default async function ratingsButton(interaction: MessageComponentInteraction) {
  const workId = sessions[interaction.user?.id ?? "u"];

  if (!workId) {
    return interaction.reply({
      content: "I don't know which book you're looking at!",
      flags: MessageFlags.Ephemeral,
    } as never);
  }

  const ratings = await fetchBook("work", workId, true);

  return interaction.reply({
    content: `${"⭐".repeat(Math.round(ratings.average))} (${ratings.count})`,
    flags: MessageFlags.Ephemeral,
  } as never);
}
