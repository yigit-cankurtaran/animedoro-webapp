import { useRouter } from "next/router";
import { ClipLoader } from "react-spinners";
import { useEffect, useState, useMemo } from "react";
import { useAtom } from "jotai";
import { watchedEpisodesAtom, totalEpisodesAtom } from "@/atoms/episodeAtoms";
import { useEpisodes } from "@/hooks/useEpisodes";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { EpisodeItem } from "@/things/EpisodeItem";

export default function AnimeId() {
  const router = useRouter();
  const { animeId } = router.query;

  const [watchedEpisodes, setWatchedEpisodes] = useAtom(watchedEpisodesAtom);
  const [totalEpisodes, setTotalEpisodes] = useAtom(totalEpisodesAtom);
  const [isFinished, setIsFinished] = useState(false);

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, error } = useEpisodes(animeId as string);

  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      setTotalEpisodes(prev => ({ ...prev, [animeId as string]: allEpisodes.length }));
    }
  }, [data, animeId, setTotalEpisodes]);

  const handleWatchedToggle = (episodeId: number) => {
    if (animeId) {
      setWatchedEpisodes(prev => {
        const animeWatched = prev[animeId as string] || [];
        const updatedWatched = animeWatched.includes(episodeId)
          ? animeWatched.filter(id => id !== episodeId)
          : [...animeWatched, episodeId];
        return { ...prev, [animeId as string]: updatedWatched };
      });
    }
  };

  const nextEpisode = useMemo(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      return allEpisodes.find((episode) => !animeWatched.includes(episode.mal_id));
    }
    return null;
  }, [watchedEpisodes, data, animeId]);

  const allEpisodes = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  useEffect(() => {
    if (data && animeId) {
      const allEpisodes = data.pages.flatMap((page) => page.data);
      const animeWatched = watchedEpisodes[animeId as string] || [];
      setIsFinished(allEpisodes.every((episode) => animeWatched.includes(episode.mal_id)));
    }
  }, [watchedEpisodes, data, animeId]);

  useInfiniteScroll(fetchNextPage, !!hasNextPage, isFetchingNextPage);

  if (isLoading) return <div className="items-center justify-center"><ClipLoader color="#ffffff" loading={isLoading} size={150} /></div>;
  if (isError) return <span>Error: {error instanceof Error ? error.message : "An error occurred"}</span>;

  const watchedCount = watchedEpisodes[animeId as string]?.length || 0;
  const totalCount = totalEpisodes[animeId as string] || 0;

  return (
    <div>
      <h1 className="text-center">The anime is {isFinished ? "finished" : "not finished"}</h1>
      <h2 className="text-center">Watched Episodes: {watchedCount} / {totalCount}</h2>
      {!isFinished && <h1 className="text-center">Next Episode: {nextEpisode?.title}</h1>}
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
