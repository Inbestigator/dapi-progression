import type { BotConfig } from "@inbestigator/discord-http";

export default { clientId: Deno.env.get("DISCORD_APP_ID") as string } satisfies BotConfig;
