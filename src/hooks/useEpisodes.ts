import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchEpisodes } from "@/utils/episodeUtils";
import Episode from "@/constants/Episode";

export function useEpisodes(animeId: string | undefined) {
  // Use react-query's useInfiniteQuery hook to fetch and manage paginated episode data
  return useInfiniteQuery<{
    data: Episode[];
    pagination: {
      last_visible_page: number;
      has_next_page: boolean;
    };
  }>({
    // Unique key for this query
    queryKey: ["episodes", animeId],
    // Function to fetch data for each page
    queryFn: async ({ pageParam = 1 }) => {
      if (animeId) {
        return fetchEpisodes(animeId, pageParam as number);
      } else {
        throw new Error("Anime ID is undefined");
      }
    },
    // Determine the next page to fetch
    getNextPageParam: (lastPage, pages) => {
      const nextPage = pages.length + 1;
      return lastPage.pagination.has_next_page ? nextPage : undefined;
    },
    // Start with page 1
    initialPageParam: 1,
    // Only run the query if animeId is provided
    enabled: !!animeId,
  });
}