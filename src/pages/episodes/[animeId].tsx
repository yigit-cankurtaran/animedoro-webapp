import { useRouter } from "next/router";
import { ClipLoader } from "react-spinners";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAtom } from "jotai";
import {
  watchedEpisodesAtom,
  totalEpisodesAtom,
  nextEpisodeAtom,
} from "@/atoms/episodeAtoms";
import { finishedListAtom, watchListAtom } from "@/atoms/animeAtoms";
import { useEpisodes } from "@/hooks/useEpisodes";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { EpisodeItem } from "@/things/EpisodeItem";
import Anime from "@/constants/Anime";
import { addToWatchlist, removeFromWatchlist } from "@/utils/watchlistUtils";

export default function AnimeId() {
  const router = useRouter();
  const { animeId } = router.query;

  // object where keys are anime IDs and values are arrays of watched episode IDs
  const [watchedEpisodes, setWatchedEpisodes] = useAtom(watchedEpisodesAtom);

  // object where keys are anime IDs and values are the total number of episodes
  const [totalEpisodes, setTotalEpisodes] = useAtom(totalEpisodesAtom);

  const [isFinished, setIsFinished] = useState(false);
  const [finishedList, setFinishedList] = useAtom(finishedListAtom);
  const [watchList, setWatchList] = useAtom(watchListAtom);
  const [episodeToWatch, setEpisodeToWatch] = useAtom(nextEpisodeAtom);

  // Fetch episode data and anime details using custom hook
  // This returns both the episodes list and basic anime information
  const { episodes, animeDetails } = useEpisodes(animeId as string);

  // Destructure the episode query results for easier access
  const {
    data,               // The actual episode data
    isLoading,          // Boolean indicating if data is being loaded
    isError,            // Boolean indicating if an error occurred
    hasNextPage,        // Boolean indicating if more episodes can be loaded
    fetchNextPage,      // Function to load the next page of episodes
    isFetchingNextPage, // Boolean indicating if the next page is being fetched
    error,             // Error object if something went wrong
  } = episodes;

  // Destructure the anime details query results
  const {
    data: animeData,           // The anime's basic information
    isLoading: animeLoading,   // Boolean indicating if anime data is loading
    isError: animeError,       // Boolean indicating if anime data fetch errored
  } = animeDetails;

  // Function to handle toggling whether an episode has been watched
  // Uses useCallback to prevent unnecessary re-renders
  const handleWatchedToggle = useCallback(
    async (episodeId: number, episodeNumber: number) => {
      if (animeId) {
        // Get the current list of watched episodes for this anime
        const animeWatched = watchedEpisodes[animeId as string] || [];

        // If watching an episode ahead of current progress
        // For example, if you've watched episodes 1-3 and try to mark episode 5
        if (
          !animeWatched.includes(episodeId) &&
          episodeNumber > animeWatched.length + 1
        ) {
          // Ask user if they want to mark all previous episodes as watched
          if (
            window.confirm(
              `Do you want to mark ${episodeNumber} episodes as watched?`
            )
          ) {
            // If user confirms, mark all episodes up to this point as watched
            setWatchedEpisodes((prev) => {
              // Create an array of episode numbers from 1 to the current episode
              const updatedWatched = Array.from(
                { length: episodeNumber },
                (_, i) => i + 1
              );
              return { ...prev, [animeId as string]: updatedWatched };
            });
          } else {
            // If user declines, only mark this specific episode as watched
            setWatchedEpisodes((prev) => {
              const updatedWatched = [...animeWatched, episodeId];
              return { ...prev, [animeId as string]: updatedWatched };
            });
          }
        } else {
          // Normal toggle behavior: if episode is watched, unwatch it; if unwatched, watch it
          setWatchedEpisodes((prev) => {
            const updatedWatched = animeWatched.includes(episodeId)
              ? animeWatched.filter((id) => id !== episodeId) // Remove episode if already watched
              : [...animeWatched, episodeId];                 // Add episode if not watched
            return { ...prev, [animeId as string]: updatedWatched };
          });
        }

        // If this anime isn't in the watch list yet, add it
        if (
          !watchList.some(
            (anime) => anime.mal_id === parseInt(animeId as string, 10)
          )
        ) {
          addToWatchlist(
            animeData as Anime,
            watchList,
            setWatchList,
            setTotalEpisodes,
          );
        }
      }
    },
    [
      animeId,
      watchedEpisodes,
      watchList,
      animeData,
      setWatchedEpisodes,
      setWatchList,
      setTotalEpisodes,
    ]
  );

  // Calculate the next unwatched episode
  const nextEpisode = useMemo(() => {
    if (data && animeId) {
      // Flatten all pages of episodes into a single array
      const allEpisodes = data.pages.flatMap((page) => page.data);
      // Get list of watched episodes for this anime
      const animeWatched = watchedEpisodes[animeId as string] || [];
      // Find first episode that hasn't been watched
      return allEpisodes.find(
        (episode) => !animeWatched.includes(episode.mal_id)
      );
    }
    return null;
  }, [watchedEpisodes, data, animeId]);

  // Check if this anime is in the finished list
  const isInFinishedList = useMemo(() => {
    return finishedList.some(
      (anime) => anime.mal_id === parseInt(animeId as string, 10)
    );
  }, [finishedList, animeId]);

  // Effect: Update the next episode to watch whenever watched episodes change
  useEffect(() => {
    if (data && animeId && !isInFinishedList) {
      // Get all episodes and currently watched episodes
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      // TODO: try making this without getting all episodes

      // Find the next unwatched episode
      const nextUnwatchedEpisode = allEpisodes.find(
        (episode) => !animeWatched.includes(episode.mal_id)
      );

      // Update the next episode information in global state
      setEpisodeToWatch((prev) => ({
        ...prev,
        [animeId as string]: {
          id: nextUnwatchedEpisode ? nextUnwatchedEpisode.mal_id : 0,
          title: nextUnwatchedEpisode ? nextUnwatchedEpisode.title : "",
          allEpisodes: allEpisodes.map((ep) => ({
            id: ep.mal_id,
            title: ep.title,
          })),
        },
      }));
    } else if (isInFinishedList) {
      // If anime is finished, remove it from next episode tracking
      setEpisodeToWatch((prev) => {
        const newState = { ...prev };
        delete newState[animeId as string];
        return newState;
      });
    }
  }, [data, watchedEpisodes, setEpisodeToWatch, animeId, isInFinishedList]);

  // Effect: Check if all episodes have been watched
  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      // Check if every episode is in the watched list
      const allWatched = allEpisodes.every((episode) =>
        animeWatched.includes(episode.mal_id)
      );
      setIsFinished(allWatched);
    }
  }, [watchedEpisodes, data, animeId]);

  // Effect: Update total episode count when new data arrives
  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      // Update total episodes, keeping the larger number if there's a discrepancy
      setTotalEpisodes((prev) => ({
        ...prev,
        [animeId as string]: Math.max(
          prev[animeId as string] || 0,
          allEpisodes.length
        ),
      }));
    }
  }, [data, animeId, setTotalEpisodes]);

  // Effect: Add anime to finished list when all episodes are watched
  useEffect(() => {
    if (isFinished && animeId && animeData) {
      const allEpisodes = data?.pages.flatMap((page) => page.data) || [];
      const animeWatched = watchedEpisodes[animeId as string] || [];
      // Double check that all episodes are actually watched
      const allActuallyWatched = allEpisodes.every((episode) =>
        animeWatched.includes(episode.mal_id)
      );

      if (allActuallyWatched) {
        setFinishedList((prev) => {
          const id = parseInt(animeId as string, 10);
          // Don't add if ID is invalid or already in list
          if (isNaN(id) || prev.some((anime) => anime.mal_id === id))
            return prev;
          // Add to finished list with finished flag
          return [
            ...prev,
            {
              ...animeData,
              finished: true,
              watching: false,
            } as Anime,
          ];
        });
      }
    }
  }, [isFinished, animeId, animeData, setFinishedList, data, watchedEpisodes]);

  // Effect: Remove from finished list if no longer finished
  useEffect(() => {
    if (!isFinished && animeId && animeData) {
      const id = parseInt(animeId as string, 10);
      // Filter out this anime from finished list
      setFinishedList((prev) => prev.filter((anime) => anime.mal_id !== id));
    }
  }, [isFinished, animeId, animeData, setFinishedList]);

  // Set up infinite scrolling for the episodes list
  useInfiniteScroll(fetchNextPage, !!hasNextPage, isFetchingNextPage);

  // Show loading spinner while data is being fetched
  if (isLoading)
    return (
      <div className="items-center justify-center">
        <ClipLoader color="#ffffff" loading={isLoading} size={150} />
      </div>
    );

  if (isError)
    return (
      <span>
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </span>
    );

  // Calculate current progress statistics
  const watchedCount = watchedEpisodes[animeId as string]?.length || 0;  // Number of watched episodes
  const totalCount = totalEpisodes[animeId as string] || 0;              // Total number of episodes
  const isBeingWatched = watchList.some((anime) => anime.mal_id === parseInt(animeId as string, 10)); // Check if anime is in watch list

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Status Section */}
      {isBeingWatched && (
        <div className="bg-slate-700 rounded-lg p-6 shadow-lg space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isFinished ? 'bg-green-400' : 'bg-blue-400'}`} />
            <h1 className="text-xl font-semibold">
              Status: {isFinished ? "Finished" : "In Progress"}
            </h1>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg text-slate-300">
              Progress: {watchedCount} / {totalCount} Episodes
            </h2>
            {/* Progress Bar */}
            <div className="w-full max-w-md h-2 bg-slate-600 rounded-full mt-2">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${(watchedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Next Episode Banner */}
      {!isFinished && nextEpisode && !isInFinishedList && (
        <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
          <h1 className="text-center text-lg font-medium text-blue-400">
            Next Episode: {nextEpisode.mal_id} - {nextEpisode.title}
          </h1>
        </div>
      )}

      {/* Episodes Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.pages
          .flatMap((page) => page.data)
          .map((episode) => (
            <EpisodeItem
              key={episode.mal_id}
              episode={episode}
              isWatched={
                watchedEpisodes[animeId as string]?.includes(episode.mal_id) ||
                false
              }
              onToggleWatched={handleWatchedToggle}
            />
          ))}
      </div>

      {/* Loading Spinner */}
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-8">
          <ClipLoader color="#60A5FA" loading={true} size={50} />
        </div>
      )}
    </div>
  );
};
