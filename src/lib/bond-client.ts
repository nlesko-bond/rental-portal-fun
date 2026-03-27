/**
 * Browser-safe fetch to the local BFF (never call Bond with the API key from the client).
 */
export function bondBffUrl(pathSegments: string[], searchParams?: URLSearchParams): string {
  const path = pathSegments.map(encodeURIComponent).join("/");
  const q = searchParams?.toString();
  return `/api/bond/${path}${q ? `?${q}` : ""}`;
}

export async function bondBffFetch(
  pathSegments: string[],
  init?: RequestInit & { searchParams?: URLSearchParams }
): Promise<Response> {
  const { searchParams, ...rest } = init ?? {};
  const url = bondBffUrl(pathSegments, searchParams);
  return fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...rest,
  });
}
