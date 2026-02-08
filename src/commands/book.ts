import {
  type APIActionRowComponent,
  type APIEmbed,
  type APIMessageActionRowComponent,
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  // deno-lint-ignore no-import-prefix
} from "npm:discord-api-types@^0.37.104/v10";
import type { CommandConfig, CommandInteraction } from "@inbestigator/discord-http";
import { fetchBook } from "../api.ts";

export const config = {
  description: "Book commands",
  options: [
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "search",
      description: "Search for a book by name",
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: "query",
          description: "The title to search for",
          required: true,
        },
      ],
    },
  ],
} satisfies CommandConfig;

export const sessions: Record<string, string> = {};

export default async function bookCommand(interaction: CommandInteraction) {
  if (interaction.data.type !== ApplicationCommandType.ChatInput) return;
  const searchSub = interaction.data.options?.find((o) => o.name === "search");
  if (searchSub?.type !== ApplicationCommandOptionType.Subcommand) return;
  const query = searchSub.options?.find((o) => o.name === "query");
  if (query?.type !== ApplicationCommandOptionType.String) return;
  const searchedBook = await fetchBook("search", query.value);

  if (!searchedBook?.key) {
    return interaction.reply({
      content: "No results found.",
      flags: MessageFlags.Ephemeral,
    } as never);
  }

  const workId = searchedBook.key.replace("/works/", "");
  const { description } = await fetchBook("work", workId);

  const embed: APIEmbed = {
    thumbnail: searchedBook.cover_i
      ? { url: `https://covers.openlibrary.org/b/id/${searchedBook.cover_i}.jpg` }
      : undefined,
    author: { name: searchedBook.author_name?.join(", ") ?? "Unknown author" },
    title: searchedBook.title,
    description:
      typeof description === "string"
        ? description
        : (description?.value ?? "No description available."),
  };
  const actionRow: APIActionRowComponent<APIMessageActionRowComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        custom_id: "ratings",
        label: "Ratings",
        style: ButtonStyle.Primary,
      },
    ],
  };
  sessions[interaction.user?.id ?? "u"] = workId;
  return interaction.reply({
    embeds: [embed],
    components: [actionRow],
    flags: MessageFlags.Ephemeral,
  } as never);
}
