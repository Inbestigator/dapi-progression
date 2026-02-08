export interface Work {
  title: string;
  description?: string | { value: string };
}

interface Ratings {
  average: number;
  count: number;
}

interface Search {
  key: string;
  title: string;
  author_name?: string[];
}

export function fetchBook<T extends "work" | "ratings">(
  route: T,
  work: string,
): Promise<T extends "ratings" ? Ratings : Work>;
export function fetchBook(route: "search", query: string): Promise<Search[]>;

export async function fetchBook(
  route: "work" | "search" | "ratings",
  workOrQuery: string,
): Promise<Work | Search[] | Ratings> {
  const res = await fetch(
    new URL(
      route === "search"
        ? `search.json?q=${encodeURIComponent(workOrQuery)}&limit=15`
        : `works/${workOrQuery}${route === "ratings" ? "/ratings.json" : ".json"}`,
      "https://openlibrary.org",
    ),
  );
  if (!res.ok) throw new Error("Bad res", { cause: res });
  const data = await res.json();
  if (route === "search") return data.docs;
  if (route === "ratings") return data.summary;
  return data;
}
