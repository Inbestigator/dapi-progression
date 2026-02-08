import { MessageFlags } from "discord-api-types/v10";
import {
  ActionRow,
  Button,
  type CommandAutocompleteInteraction,
  type CommandConfig,
  type CommandInteraction,
  CommandOption,
  Container,
  Section,
  TextDisplay,
  Thumbnail,
} from "dressed";
import { fetchBook, type Work } from "../api.ts";

export const config = {
  description: "Book commands.",
  options: [
    CommandOption({
      type: "Subcommand",
      name: "search",
      description: "Search for a book by name.",
      options: [
        CommandOption({
          type: "String",
          name: "work",
          description: "The work to search for.",
          autocomplete: true,
          required: true,
        }),
      ],
    }),
  ],
} satisfies CommandConfig;

export async function autocomplete(interaction: CommandAutocompleteInteraction<typeof config>) {
  const query = interaction.options.search?.options.work;
  if (!query || interaction.focused !== "search.work") return;

  const searchRes = await fetchBook("search", query);

  return interaction.sendChoices(
    searchRes.map((r) => ({
      name: r.title,
      value: `${r.key.replace("/works/", "")}:${r.author_name?.join(", ").slice(0, 85)}`,
    })),
  );
}

export default async function bookCommand(interaction: CommandInteraction<typeof config>) {
  const subcommand = interaction.options.search;
  if (subcommand?.name !== "search") return;

  const [id, authors] = subcommand.options.work.split(":");
  let work: Work;

  try {
    work = await fetchBook("work", id);
  } catch {
    return interaction.reply({ content: "No results found.", ephemeral: true });
  }

  return interaction.reply({
    components: [
      Container(
        Section(
          [
            TextDisplay(`## ${work.title}\n-# ${authors ?? "Unknown author"}`),
            TextDisplay(
              typeof work.description === "string"
                ? work.description
                : (work.description?.value ?? "No description available."),
            ),
          ],
          Thumbnail(`https://covers.openlibrary.org/w/olid/${id}.jpg`),
        ),
        ActionRow(
          Button({ custom_id: `ratings-${id}`, label: "Ratings" }),
          Button({ url: `https://openlibrary.org/works/${id}`, label: "View on OpenLibrary" }),
        ),
      ),
    ],
    flags: MessageFlags.IsComponentsV2,
    ephemeral: true,
  });
}
