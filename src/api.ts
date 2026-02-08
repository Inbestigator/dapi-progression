interface Work {
  description?: string | { value: string };
}

interface Ratings {
  average: number;
  count: number;
}

interface Search {
  key?: string;
  cover_i?: number;
  author_name?: string[];
  title: string;
}

export function fetchBook<R extends true | undefined = undefined>(
  route: "work",
  work: string,
  ratings?: R,
): Promise<R extends true ? Ratings : Work>;
export function fetchBook(route: "search", query: string): Promise<Search>;

export async function fetchBook(
  route: "work" | "search",
  workOrQuery: string,
  ratings = false,
): Promise<Work | Search | Ratings> {
  const res = await fetch(
    new URL(
      route === "search"
        ? `search.json?q=${encodeURIComponent(workOrQuery)}&limit=1`
        : `works/${workOrQuery}${ratings ? "/ratings.json" : ".json"}`,
      "https://openlibrary.org",
    ),
  );
  if (!res.ok) throw new Error("Bad res", { cause: res });
  const data = await res.json();
  if (route === "search") return data.docs[0];
  if (ratings) return data.summary;
  return data;
}
