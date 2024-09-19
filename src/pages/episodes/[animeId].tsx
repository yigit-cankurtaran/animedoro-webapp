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
import { fetchEpisodes } from "@/utils/episodeUtils";
import Episode from "@/constants/Episode";

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


const fetchAllPagesAndSetTotalEpisodes = useCallback(async () => {
  if (!animeId) return;

  let allEpisodes: Episode[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data, pagination } = await fetchEpisodes(animeId as string, page);
    allEpisodes = [...allEpisodes, ...data];
    hasNextPage = pagination.has_next_page;
    page++;
  }

  const totalEpisodeCount = allEpisodes.length;
  setTotalEpisodes(prev => ({ ...prev, [animeId as string]: totalEpisodeCount }));
}, [animeId, setTotalEpisodes]);

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

      // If the anime is not in the watchlist, add it and fetch all episodes
      if (!watchList.some(anime => anime.mal_id === parseInt(animeId as string, 10))) {
        setWatchList(prev => {
          const id = parseInt(animeId as string, 10);
          if (isNaN(id) || prev.some(anime => anime.mal_id === id)) return prev;
          return [...prev, {
            ...animeData,
            finished: false,
            watching: true
          } as Anime];
        });

        // Fetch all pages and set total episodes
        await fetchAllPagesAndSetTotalEpisodes();
      }
    }
  }, [animeId, watchedEpisodes, watchList, animeData, setWatchedEpisodes, setWatchList, fetchAllPagesAndSetTotalEpisodes]);

  // Find the next unwatched episode
  const nextEpisode = useMemo(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      return allEpisodes.find((episode) => !animeWatched.includes(episode.mal_id));
    }
    return null;
  }, [watchedEpisodes, data, animeId]);

  // Set the next episode to watch
  useEffect(() => {
    if (nextEpisode && animeId) {
      setEpisodeToWatch(prev => ({
        ...prev,
        [animeId as string]: { id: nextEpisode.mal_id, title: nextEpisode.title }
      }));
    }
  }, [nextEpisode, setEpisodeToWatch, animeId]);

  // Get all episodes
  const allEpisodes = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  // Check if all episodes are watched
  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      setIsFinished(allEpisodes.every((episode) => animeWatched.includes(episode.mal_id)));
    }
  }, [watchedEpisodes, data, animeId]);

  // if all episodes are watched, add the anime to the finished list and remove it from the watchlist
  useEffect(() => {
    if (isFinished && animeId && animeData) {
      setFinishedList(prev => {
        const id = parseInt(animeId as string, 10);
        if (isNaN(id) || prev.some(anime => anime.mal_id === id)) return prev;
        return [...prev, {
          ...animeData,
          finished: true,
          watching: false
        } as Anime];
      });
      setWatchList(prev => prev.filter(anime => anime.mal_id !== parseInt(animeId as string, 10)));
    }
  }, [isFinished, animeId, animeData, setFinishedList]);

  
  useEffect(() => {
    // if the anime isn't finished, remove it from the finished list
    if (!isFinished && animeId && animeData) {
      setFinishedList(prev => prev.filter(anime => anime.mal_id !== parseInt(animeId as string, 10)));
    }
  }, [isFinished, animeId, animeData, setFinishedList]);

  // TODO: if the anime is in the finished list, take it out of the watchlist

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
      {!isFinished && nextEpisode && (
        <h1 className="text-center">Next Episode: {nextEpisode.title}</h1>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 text-wrap min-h-full w-full h-full">
        {allEpisodes.map((episode) => (
          <EpisodeItem
            key={episode.mal_id}
            episode={episode}
            isWatched={watchedEpisodes[animeId as string]?.includes(episode.mal_id) || false}
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

// This component is used to display the episodes of an anime

// TODO: test watching an episode adding to the watchlist
// TODO: implement finishing the anime removing it from the watchlist
