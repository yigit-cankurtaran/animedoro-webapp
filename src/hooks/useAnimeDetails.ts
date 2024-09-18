import { useQuery } from "@tanstack/react-query";
import Anime from "@/constants/Anime";

async function fetchAnimeDetails(animeId: string): Promise<Anime> {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
  if (!response.ok) throw new Error("Failed to fetch anime details");
  const result = await response.json();
  return result.data;
}

export function useAnimeDetails(animeId: string | undefined) {
  return useQuery<Anime, Error>({
    queryKey: ["animeDetails", animeId],
    queryFn: () => fetchAnimeDetails(animeId as string),
    enabled: !!animeId,
  });
}
