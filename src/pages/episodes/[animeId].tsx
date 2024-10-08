// TODO: when an anime is added to the watchlist download all the episodes
// TODO: check if there's a new page of episodes when the user accesses the page or clicks the plus button
// TODO: refetch the final page of episodes when the user accesses the page

// Import necessary dependencies and components
import { useRouter } from "next/router";
import { ClipLoader } from "react-spinners";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAtom } from "jotai";
import { watchedEpisodesAtom, totalEpisodesAtom, nextEpisodeAtom } from "@/atoms/episodeAtoms";
import { finishedListAtom, watchListAtom } from "@/atoms/animeAtoms";
import { useEpisodes } from "@/hooks/useEpisodes";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { EpisodeItem } from "@/things/EpisodeItem";
import Anime from "@/constants/Anime";
import { addToWatchlist, removeFromWatchlist } from '@/utils/watchlistUtils';

export default function AnimeId() {
  // Get animeId from router query
  const router = useRouter();
  const { animeId } = router.query;

  // Set up state using Jotai atoms
  const [watchedEpisodes, setWatchedEpisodes] = useAtom(watchedEpisodesAtom);
  const [totalEpisodes, setTotalEpisodes] = useAtom(totalEpisodesAtom);
  const [isFinished, setIsFinished] = useState(false);
  const [finishedList, setFinishedList] = useAtom(finishedListAtom);
  const [watchList, setWatchList] = useAtom(watchListAtom);
  const [episodeToWatch, setEpisodeToWatch] = useAtom(nextEpisodeAtom);

  // Fetch episodes data
  const { episodes, animeDetails } = useEpisodes(animeId as string);

  // Destructure the queries
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, error } = episodes;
  const { data: animeData, isLoading: animeLoading, isError: animeError } = animeDetails;

  // Handle toggling watched status for episodes
  const handleWatchedToggle = useCallback(async (episodeId: number, episodeNumber: number) => {
    if (animeId) {
      const animeWatched = watchedEpisodes[animeId as string] || [];
      if (!animeWatched.includes(episodeId) && episodeNumber > animeWatched.length + 1) {
        if (window.confirm(`Do you want to mark ${episodeNumber} episodes as watched?`)) {
          setWatchedEpisodes(prev => {
            const updatedWatched = Array.from({ length: episodeNumber }, (_, i) => i + 1);
            return { ...prev, [animeId as string]: updatedWatched };
          });
        } else {
          setWatchedEpisodes(prev => {
            const updatedWatched = [...animeWatched, episodeId];
            return { ...prev, [animeId as string]: updatedWatched };
          });
        }
      } else {
        setWatchedEpisodes(prev => {
          const updatedWatched = animeWatched.includes(episodeId)
            ? animeWatched.filter(id => id !== episodeId)
            : [...animeWatched, episodeId];
          return { ...prev, [animeId as string]: updatedWatched };
        });
      }

      // If the anime is not in the watchlist, add it
      if (!watchList.some(anime => anime.mal_id === parseInt(animeId as string, 10))) {
        addToWatchlist(animeData as Anime, watchList, setWatchList, setTotalEpisodes);
      }
    }
  }, [animeId, watchedEpisodes, watchList, animeData, setWatchedEpisodes, setWatchList, setTotalEpisodes]);

  // Find the next unwatched episode
  const nextEpisode = useMemo(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      return allEpisodes.find((episode) => !animeWatched.includes(episode.mal_id));
    }
    return null;
  }, [watchedEpisodes, data, animeId]);

  // Check if the anime is in the finished list
  const isInFinishedList = useMemo(() => {
    return finishedList.some(anime => anime.mal_id === parseInt(animeId as string, 10));
  }, [finishedList, animeId]);

  // Set the next episode to watch only if the anime is not in the finished list
  useEffect(() => {
    if (data && animeId && !isInFinishedList) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      const nextUnwatchedEpisode = allEpisodes.find((episode) => !animeWatched.includes(episode.mal_id));
      
      setEpisodeToWatch(prev => ({
        ...prev,
        [animeId as string]: { 
          id: nextUnwatchedEpisode ? nextUnwatchedEpisode.mal_id : 0, 
          title: nextUnwatchedEpisode ? nextUnwatchedEpisode.title : '',
          allEpisodes: allEpisodes.map(ep => ({ id: ep.mal_id, title: ep.title }))
        }
      }));
    } else if (isInFinishedList) {
      // Remove the next episode information if the anime is in the finished list
      // if we don't do this, the final episode will be shown as the next episode to watch
      setEpisodeToWatch(prev => {
        const newState = { ...prev };
        delete newState[animeId as string];
        return newState;
      });
    }
  }, [data, watchedEpisodes, setEpisodeToWatch, animeId, isInFinishedList]);

  // Check if all episodes are watched
  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      const allWatched = allEpisodes.every((episode) => animeWatched.includes(episode.mal_id));
      setIsFinished(allWatched);
    }
  }, [watchedEpisodes, data, animeId]);

  // Update the total episode count whenever new episodes are loaded
  // helps with new episode releases
  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      setTotalEpisodes(prev => ({
        ...prev,
        [animeId as string]: Math.max(prev[animeId as string] || 0, allEpisodes.length)
      }));
    }
  }, [data, animeId, setTotalEpisodes]);

  // if all episodes are watched, add the anime to the finished list
  useEffect(() => {
    // Check if the anime is finished, animeId is available, and animeData is present
    if (isFinished && animeId && animeData) {
      // Flatten all episodes from data pages into a single array, default to empty if data is undefined
      const allEpisodes = data?.pages.flatMap((page) => page.data) || [];
      // Get the episodes watched for the current animeId, default to empty if not found
      const animeWatched = watchedEpisodes[animeId as string] || [];
      // Check if all episodes are actually watched
      const allActuallyWatched = allEpisodes.every((episode) => animeWatched.includes(episode.mal_id));

      // If all episodes are watched, add the anime to the finished list
      if (allActuallyWatched) {
        setFinishedList(prev => {
          // Convert animeId to a number to match the type in the finished list
          const id = parseInt(animeId as string, 10);
          // Check if the anime is already in the finished list or if the id is invalid
          if (isNaN(id) || prev.some(anime => anime.mal_id === id)) return prev;
          // Add the anime to the finished list with finished and watching status updated
          return [...prev, {
            ...animeData,
            finished: true,
            watching: false
          } as Anime];
        });
      }
    }
  }, [isFinished, animeId, animeData, setFinishedList, data, watchedEpisodes]);

  // if the anime isn't finished, remove it from the finished list
  useEffect(() => {
    if (!isFinished && animeId && animeData) {
      // Convert animeId to a number to match the type in the finished list
      const id = parseInt(animeId as string, 10);
      // Filter out the anime from the finished list if it exists
      setFinishedList(prev => prev.filter(anime => anime.mal_id !== id));
    }
  }, [isFinished, animeId, animeData, setFinishedList]);

  // Update the total episode count whenever new episodes are loaded
  // helps with new episode releases
  useEffect(() => {
    // Check if data and animeId are available
    if (data && animeId) {
      // Flatten all episodes from data pages into a single array
      const allEpisodes = data.pages.flatMap((page) => page.data);
      // Update total episodes count for the current animeId
      setTotalEpisodes(prev => ({
        ...prev,
        [animeId as string]: Math.max(prev[animeId as string] || 0, allEpisodes.length)
      }));
    }
  }, [data, animeId, setTotalEpisodes]);

  // Set up infinite scrolling
  useInfiniteScroll(fetchNextPage, !!hasNextPage, isFetchingNextPage);

  // Show loading spinner while fetching data
  if (isLoading) return <div className="items-center justify-center"><ClipLoader color="#ffffff" loading={isLoading} size={150} /></div>;
  // Show error message if fetch fails
  if (isError) return <span>Error: {error instanceof Error ? error.message : "An error occurred"}</span>;

  // Calculate watched and total episode counts
  const watchedCount = watchedEpisodes[animeId as string]?.length || 0;
  const totalCount = totalEpisodes[animeId as string] || 0;

  // Render the component
  return (
    <div>
      <h1 className="text-center">The anime is {isFinished ? "finished" : "not finished"}</h1>
      <h2 className="text-center">Watched Episodes: {watchedCount} / {totalCount}</h2>
      {!isFinished && nextEpisode && !isInFinishedList && (
        <h1 className="text-center">Next Episode: {nextEpisode.title}</h1>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 text-wrap min-h-full w-full h-full">
        {/* Map over all episodes and render an EpisodeItem for each one */}
        {data?.pages.flatMap((page) => page.data).map((episode) => (
          <EpisodeItem
            key={episode.mal_id}
            episode={episode}
            isWatched={watchedEpisodes[animeId as string]?.includes(episode.mal_id) || false}
            onToggleWatched={handleWatchedToggle}
          />
        ))}
      </div>
      {/* Show loading spinner if fetching next page */}
      {isFetchingNextPage && (
        <div className="flex justify-center items-center w-full">
          <ClipLoader color="#ffffff" loading={true} size={150} />
        </div>
      )}
    </div>
  );
}

// This component is used to display the episodes of an anime