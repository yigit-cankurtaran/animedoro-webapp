import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchEpisodes } from "@/utils/episodeUtils";
import Episode from "@/constants/Episode";
import Anime from "@/constants/Anime";

async function fetchAnimeDetails(animeId: string): Promise<Anime> {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
  if (!response.ok) throw new Error("Failed to fetch anime details");
  const result = await response.json();
  return result.data;
}

export function useEpisodes(animeId: string | undefined) {
  const episodesQuery = useInfiniteQuery<{
    data: Episode[];
    pagination: {
      last_visible_page: number;
      has_next_page: boolean;
    };
  }>({
    queryKey: ["episodes", animeId],
    queryFn: async ({ pageParam = 1 }) => {
      if (animeId) {
        return fetchEpisodes(animeId, pageParam as number);
      } else {
        throw new Error("Anime ID is undefined");
      }
    },
    getNextPageParam: (lastPage, pages) => {
      const nextPage = pages.length + 1;
      return lastPage.pagination.has_next_page ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: !!animeId,
  });

  const animeDetailsQuery = useQuery<Anime, Error>({
    queryKey: ["animeDetails", animeId],
    queryFn: () => fetchAnimeDetails(animeId as string),
    enabled: !!animeId,
  });

  return {
    episodes: episodesQuery,
    animeDetails: animeDetailsQuery,
  };
}