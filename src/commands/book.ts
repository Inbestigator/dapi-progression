import {
  ActionRow,
  Button,
  type CommandConfig,
  type CommandInteraction,
  CommandOption,
} from "dressed";
import { fetchBook } from "../api.ts";

export const config = {
  description: "Book commands",
  options: [
    CommandOption({
      type: "Subcommand",
      name: "search",
      description: "Search for a book by name",
      options: [
        CommandOption({
          type: "String",
          name: "query",
          description: "The title to search for",
          required: true,
        }),
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
