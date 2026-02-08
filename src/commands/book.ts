// deno-lint-ignore no-import-prefix
import type { APIApplicationCommandStringOption } from "npm:discord-api-types@^0.37.104/v10";
import {
  ActionRow,
  Button,
  type CommandConfig,
  type CommandInteraction,
  Option,
} from "@inbestigator/discord-http";
import { fetchBook } from "../api.ts";

export const config = {
  description: "Book commands",
  options: [
    Option({
      type: "Subcommand",
      name: "search",
      description: "Search for a book by name",
      options: [
        Option({
          type: "String",
          name: "query",
          description: "The title to search for",
          required: true,
        }) as APIApplicationCommandStringOption,
      ],
    }),
  ],
} satisfies CommandConfig;

export default async function bookCommand(interaction: CommandInteraction) {
  const searchSub = interaction.getOption("search")?.subcommand();
  const query = searchSub?.getOption("query")?.string();

  if (!query) return;

  const searchedBook = await fetchBook("search", query);

  if (!searchedBook?.key) {
    return interaction.reply({ content: "No results found.", ephemeral: true });
  }

  const workId = searchedBook.key.replace("/works/", "");
  const { description } = await fetchBook("work", workId);

  return interaction.reply({
    embeds: [
      {
        thumbnail: searchedBook.cover_i
          ? { url: `https://covers.openlibrary.org/b/id/${searchedBook.cover_i}.jpg` }
          : undefined,
        author: { name: searchedBook.author_name?.join(", ") ?? "Unknown author" },
        title: searchedBook.title,
        description:
          typeof description === "string"
            ? description
            : (description?.value ?? "No description available."),
      },
    ],
    components: [ActionRow(Button({ custom_id: `ratings-${workId}`, label: "Ratings" }))],
    ephemeral: true,
  });
}
