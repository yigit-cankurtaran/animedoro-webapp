import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import debounce from 'lodash/debounce';
import Anime from "@/constants/Anime";

// Define the structure of the API response
interface Data {
  data: Anime[];
}

export function useAnimeSearch() {
  // Initialize state for search query and search status
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Define the function to fetch anime data
  const fetchAnime = useCallback(async () => {
    if (!searchQuery) return { data: [] };
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${searchQuery}`);
    if (!response.ok) throw new Error("failed to fetch");
    return response.json();
  }, [searchQuery]);

  // Use react-query to manage API request state
  // automatic refetch when searchQuery changes
  const { isLoading, isError, data, error } = useQuery<Data>({
    queryKey: ["animes", searchQuery],
    queryFn: fetchAnime,
    enabled: !!searchQuery, // only fetch when searchQuery is not empty
  });

  // Create a debounced function to update search query
  // delay to not overload the API
  const debouncedSetSearchQuery = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  // Extract anime data from the API response
  const animeData = useMemo(() => data?.data || [], [data]);

  // Return all necessary data and functions
  return {
    isLoading,
    isError,
    animeData,
    error,
    searchPerformed,
    setSearchPerformed,
    debouncedSetSearchQuery,
  };
}