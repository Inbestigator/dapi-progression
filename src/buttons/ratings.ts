import type { Params } from "@dressed/matcher";
import type { ComponentInteraction } from "@dressed/react";
import { fetchBook } from "../api";

export const pattern = "ratings-:id";

export default async function (interaction: ComponentInteraction, { id }: Params<typeof pattern>) {
  const ratings = await fetchBook("ratings", id);
  return interaction.reply(`${"⭐".repeat(Math.round(ratings.average))} (${ratings.count})`, {
    ephemeral: true,
  });
}
