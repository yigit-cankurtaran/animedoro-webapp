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

  const [watchedEpisodes, setWatchedEpisodes] = useAtom(watchedEpisodesAtom);
  const [totalEpisodes, setTotalEpisodes] = useAtom(totalEpisodesAtom);
  const [isFinished, setIsFinished] = useState(false);
  const [finishedList, setFinishedList] = useAtom(finishedListAtom);
  const [watchList, setWatchList] = useAtom(watchListAtom);
  const [episodeToWatch, setEpisodeToWatch] = useAtom(nextEpisodeAtom);

  const { episodes, animeDetails } = useEpisodes(animeId as string);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = episodes;
  const {
    data: animeData,
    isLoading: animeLoading,
    isError: animeError,
  } = animeDetails;

  const handleWatchedToggle = useCallback(
    async (episodeId: number, episodeNumber: number) => {
      if (animeId) {
        const animeWatched = watchedEpisodes[animeId as string] || [];
        if (
          !animeWatched.includes(episodeId) &&
          episodeNumber > animeWatched.length + 1
        ) {
          if (
            window.confirm(
              `Do you want to mark ${episodeNumber} episodes as watched?`
            )
          ) {
            setWatchedEpisodes((prev) => {
              const updatedWatched = Array.from(
                { length: episodeNumber },
                (_, i) => i + 1
              );
              return { ...prev, [animeId as string]: updatedWatched };
            });
          } else {
            setWatchedEpisodes((prev) => {
              const updatedWatched = [...animeWatched, episodeId];
              return { ...prev, [animeId as string]: updatedWatched };
            });
          }
        } else {
          setWatchedEpisodes((prev) => {
            const updatedWatched = animeWatched.includes(episodeId)
              ? animeWatched.filter((id) => id !== episodeId)
              : [...animeWatched, episodeId];
            return { ...prev, [animeId as string]: updatedWatched };
          });
        }

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

  const nextEpisode = useMemo(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      return allEpisodes.find(
        (episode) => !animeWatched.includes(episode.mal_id)
      );
    }
    return null;
  }, [watchedEpisodes, data, animeId]);

  const isInFinishedList = useMemo(() => {
    return finishedList.some(
      (anime) => anime.mal_id === parseInt(animeId as string, 10)
    );
  }, [finishedList, animeId]);

  useEffect(() => {
    if (data && animeId && !isInFinishedList) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      const nextUnwatchedEpisode = allEpisodes.find(
        (episode) => !animeWatched.includes(episode.mal_id)
      );

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
      setEpisodeToWatch((prev) => {
        const newState = { ...prev };
        delete newState[animeId as string];
        return newState;
      });
    }
  }, [data, watchedEpisodes, setEpisodeToWatch, animeId, isInFinishedList]);

  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      const allWatched = allEpisodes.every((episode) =>
        animeWatched.includes(episode.mal_id)
      );
      setIsFinished(allWatched);
    }
  }, [watchedEpisodes, data, animeId]);

  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      setTotalEpisodes((prev) => ({
        ...prev,
        [animeId as string]: Math.max(
          prev[animeId as string] || 0,
          allEpisodes.length
        ),
      }));
    }
  }, [data, animeId, setTotalEpisodes]);

  useEffect(() => {
    if (isFinished && animeId && animeData) {
      const allEpisodes = data?.pages.flatMap((page) => page.data) || [];
      const animeWatched = watchedEpisodes[animeId as string] || [];
      const allActuallyWatched = allEpisodes.every((episode) =>
        animeWatched.includes(episode.mal_id)
      );

      if (allActuallyWatched) {
        setFinishedList((prev) => {
          const id = parseInt(animeId as string, 10);
          if (isNaN(id) || prev.some((anime) => anime.mal_id === id))
            return prev;
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

  useEffect(() => {
    if (!isFinished && animeId && animeData) {
      const id = parseInt(animeId as string, 10);
      setFinishedList((prev) => prev.filter((anime) => anime.mal_id !== id));
    }
  }, [isFinished, animeId, animeData, setFinishedList]);

  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      setTotalEpisodes((prev) => ({
        ...prev,
        [animeId as string]: Math.max(
          prev[animeId as string] || 0,
          allEpisodes.length
        ),
      }));
    }
  }, [data, animeId, setTotalEpisodes]);

  useInfiniteScroll(fetchNextPage, !!hasNextPage, isFetchingNextPage);

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

  const watchedCount = watchedEpisodes[animeId as string]?.length || 0;
  const totalCount = totalEpisodes[animeId as string] || 0;
  const isBeingWatched = watchList.some((anime) => anime.mal_id === parseInt(animeId as string, 10));
  // checking if the current anime is in the watchlist


  // return (
  //   <div>
  //     {isBeingWatched && (
  //       <>
  //         <h1 className="text-center">
  //           The anime is {isFinished ? "finished" : "not finished"}
  //         </h1>
  //         <h2 className="text-center">
  //           Watched Episodes: {watchedCount} / {totalCount}
  //         </h2>
  //       </>
  //     )}
  //     {!isFinished && nextEpisode && !isInFinishedList && (
  //       <h1 className="text-center">Next Episode: {nextEpisode.title}</h1>
  //     )}
  //     <div className="grid grid-cols-2 sm:grid-cols-4 text-wrap min-h-full w-full h-full">
  //       {data?.pages
  //         .flatMap((page) => page.data)
  //         .map((episode) => (
  //           <EpisodeItem
  //             key={episode.mal_id}
  //             episode={episode}
  //             isWatched={
  //               watchedEpisodes[animeId as string]?.includes(episode.mal_id) ||
  //               false
  //             }
  //             onToggleWatched={handleWatchedToggle}
  //           />
  //         ))}
  //     </div>
  //     {isFetchingNextPage && (
  //       <div className="flex justify-center items-center w-full">
  //         <ClipLoader color="#ffffff" loading={true} size={150} />
  //       </div>
  //     )}
  //   </div>
  // );
  //

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
