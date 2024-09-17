// Import necessary dependencies and components
import { useRouter } from "next/router";
import { ClipLoader } from "react-spinners";
import { useEffect, useState, useMemo } from "react";
import { useEpisodes } from "@/hooks/useEpisodes";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { EpisodeItem } from "@/things/EpisodeItem";
import { loadWatchedEpisodes, saveWatchedEpisodes } from "@/utils/episodeUtils";

export default function AnimeId() {
  // Get animeId from router query
  const router = useRouter();
  const { animeId } = router.query;

  // Initialize state for watched episodes and finished status
  const [watchedEpisodes, setWatchedEpisodes] = useState<{ [key: number]: boolean }>({});
  const [isFinished, setIsFinished] = useState(false);

  // Fetch episodes data using custom hook
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, error } = useEpisodes(animeId as string);

  // Load watched episodes from local storage on component mount
  useEffect(() => {
    if (animeId) {
      const storedWatchedEpisodes = loadWatchedEpisodes(animeId as string);
      setWatchedEpisodes(storedWatchedEpisodes);
    }
  }, [animeId]);

  // Handle toggling watched status for episodes
  const handleWatchedToggle = (episodeId: number) => {
    if (watchedEpisodes[episodeId]) {
      // If episode is already watched, mark it as unwatched
      setWatchedEpisodes((prevWatchedEpisodes) => ({
        ...prevWatchedEpisodes,
        [episodeId]: false,
      }));
      saveWatchedEpisodes(animeId as string, {
        ...watchedEpisodes,
        [episodeId]: false,
      });
      return;
    }

    // If marking an episode as watched and previous episodes are unwatched
    if (episodeId > 1 && !watchedEpisodes[episodeId - 1]) {
      if (window.confirm(`Mark all episodes before ${episodeId} as watched?`)) {
        // Mark all previous episodes as watched
        const newWatchedEpisodes = {
          ...watchedEpisodes,
        };
        for (let i = episodeId - 1; i >= 1; i--) {
          newWatchedEpisodes[i] = true;
        }

        setWatchedEpisodes(newWatchedEpisodes);
        saveWatchedEpisodes(animeId as string, newWatchedEpisodes);
        console.log("Marked all episodes before " + episodeId + " as watched");
      }
    }

    // Toggle watched status for the current episode
    setWatchedEpisodes((prevWatchedEpisodes) => {
      const newWatchedState = !prevWatchedEpisodes[episodeId];
      const updatedWatchedEpisodes = {
        ...prevWatchedEpisodes,
        [episodeId]: newWatchedState,
      };

      saveWatchedEpisodes(animeId as string, updatedWatchedEpisodes);
      console.log("hit the button on episode " + episodeId);

      return updatedWatchedEpisodes;
    });
  };

  // Flatten episode data from all pages
  const allEpisodes = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  // Check if all episodes are watched
  useEffect(() => {
    if (data) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      setIsFinished(allEpisodes.every((episode) => watchedEpisodes[episode.mal_id]));
    }
  }, [watchedEpisodes, data]);

  // Set up infinite scrolling
  useInfiniteScroll(fetchNextPage, !!hasNextPage, isFetchingNextPage);

  // Show loading spinner while data is being fetched
  if (isLoading) return <div className="items-center justify-center"><ClipLoader color="#ffffff" loading={isLoading} size={150} /></div>;
  // Show error message if there's an error
  if (isError) return <span>Error: {error instanceof Error ? error.message : "An error occurred"}</span>;

  // Render episode list
  return (
    <div>
      <h1 className="text-center">Finished: {String(isFinished)}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 text-wrap min-h-full w-full h-full">
        {allEpisodes.map((episode) => (
          <EpisodeItem
            key={episode.mal_id}
            episode={episode}
            isWatched={watchedEpisodes[episode.mal_id]}
            onToggleWatched={handleWatchedToggle}
          />
        ))}
      </div>
      {isFetchingNextPage && (
        <div className="flex justify-center items-center w-full">
          <ClipLoader color="#ffffff" loading={true} size={150} />
        </div>
      )}
    </div>
  );
}
