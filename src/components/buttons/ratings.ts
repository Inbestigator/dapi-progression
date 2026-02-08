import type { Params } from "@dressed/matcher";
import type { MessageComponentInteraction } from "dressed";
import { fetchBook } from "../../api.ts";

export const pattern = "ratings-:id";

export default async function ratingsButton(
  interaction: MessageComponentInteraction,
  { id }: Params<typeof pattern>,
) {
  const ratings = await fetchBook("ratings", id);
  return interaction.reply({
    content: `${"⭐".repeat(Math.round(ratings.average))} (${ratings.count})`,
    ephemeral: true,
  });
}
