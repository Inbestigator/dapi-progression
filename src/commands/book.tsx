import {
  ActionRow,
  Button,
  type CommandInteraction,
  Container,
  Section,
  TextDisplay,
  Thumbnail,
} from "@dressed/react";
import { type CommandAutocompleteInteraction, type CommandConfig, CommandOption } from "dressed";
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

  return searchRes.map((r) => ({
    name: r.title,
    value: `${r.key.replace("/works/", "")}:${r.author_name?.join(", ").slice(0, 85)}`,
  }));
}

export default async function bookCommand(interaction: CommandInteraction<typeof config>) {
  const subcommand = interaction.options.search;
  if (subcommand?.name !== "search") return;

  const [id, authors] = subcommand.options.work.split(":") as [string, string];
  let work: Work;

  try {
    work = await fetchBook("work", id);
  } catch {
    return interaction.reply("No results found.", { ephemeral: true });
  }

  return interaction.reply(
    <Container>
      <Section accessory={<Thumbnail media={`https://covers.openlibrary.org/w/olid/${id}.jpg`} />}>
        ## {work.title}
        {"\n"}-# {authors ?? "Unknown author"}
        <TextDisplay>
          {typeof work.description === "string"
            ? work.description
            : (work.description?.value ?? "No description available.")}
        </TextDisplay>
      </Section>
      <ActionRow>
        <Button
          onClick={async (i) => {
            const ratings = await fetchBook("ratings", id);
            return i.reply(`${"⭐".repeat(Math.round(ratings.average))} (${ratings.count})`, {
              ephemeral: true,
            });
          }}
          label="Ratings"
        />
        <Button url={`https://openlibrary.org/works/${id}`} label="View on OpenLibrary" />
      </ActionRow>
    </Container>,
    { ephemeral: true },
  );
}
