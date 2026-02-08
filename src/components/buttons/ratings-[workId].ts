import type { MessageComponentInteraction } from "@dressed/dressed";
import { fetchBook } from "../../api.ts";

export default async function ratingsButton(
  interaction: MessageComponentInteraction,
  { workId }: { workId: string },
) {
  const ratings = await fetchBook("work", workId, true);
  return interaction.reply({
    content: `${"⭐".repeat(Math.round(ratings.average))} (${ratings.count})`,
    ephemeral: true,
  });
}
