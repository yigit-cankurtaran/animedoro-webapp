import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from "jotai";
import { watchListAtom, finishedListAtom } from "@/atoms/animeAtoms";
import Anime from "@/constants/Anime";
import { nextEpisodeAtom, watchedEpisodesAtom, totalEpisodesAtom } from "@/atoms/episodeAtoms";
import { fetchEpisodes } from "@/utils/episodeUtils";
import { TimerForm } from '@/things/TimerForm';
import { TimerDisplay } from '@/things/TimerDisplay';
import { TimerControls } from '@/things/TimerControls';
import { EpisodeList } from '@/things/EpisodeList';
import { successToast } from "@/things/Toast";

const DEFAULT_TIME = 40 * 60; // 40 minutes in seconds

export default function Timer() {
  // Keep track of both the initial duration and the current duration
  const [initialDuration, setInitialDuration] = useState(DEFAULT_TIME);
  const [currentDuration, setCurrentDuration] = useState(DEFAULT_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0); // Add a key state to force re-render of timer
  // we need this for the stop button to work
  const [episodeToWatch, setEpisodeToWatch] = useAtom(nextEpisodeAtom);
  const [watchList, setWatchList] = useAtom(watchListAtom);
  const [finishedList, setFinishedList] = useAtom(finishedListAtom);
  const [watchedEpisodes, setWatchedEpisodes] = useAtom(watchedEpisodesAtom);
  const [totalEpisodes] = useAtom(totalEpisodesAtom);

  // lookup table for anime titles
  // This useMemo hook is used to memoize the anime titles based on the watchList state.
  // It reduces the watchList array into an object where the keys are the anime's mal_id and the values are their titles.
  // If the anime has an English title, it uses that; otherwise, it uses the Japanese title or defaults to 'Unknown'.
  const animeTitles = React.useMemo(() => {
    return watchList.reduce((acc, anime: Anime) => {
      // For each anime in the watchList, add an entry to the accumulator object.
      // The key is the anime's mal_id, and the value is its title (English if available, Japanese if not, or 'Unknown' if neither).
      acc[anime.mal_id] = anime.title_english || anime.title_japanese || 'Unknown';
      return acc;
    }, {} as Record<number, string>);
  }, [watchList]);

  const watchEpisode = async (animeId: number, episodeId: number) => {
    // Mark episode as watched
    setWatchedEpisodes(prevEpisodes => {
      // Add the current episode to the watched episodes for this anime
      const updatedEpisodes = [...(prevEpisodes[animeId] || []), episodeId];
      // Return the updated watched episodes object
      return { ...prevEpisodes, [animeId]: updatedEpisodes };
    });
    successToast(`Watched episode ${episodeId} of ${animeTitles[animeId]}`);

    // Calculate the total number of episodes watched for this anime
    const watchedCount = (watchedEpisodes[animeId] || []).length + 1; // +1 for the episode we just watched

    // Fetch next page if needed
    if (watchedCount % 100 === 0) {
      console.log("Fetching next page of episodes");
      try {
        // Calculate the next page number
        const nextPage = Math.floor(watchedCount / 100) + 1;
        // Fetch the next page of episodes
        const { data } = await fetchEpisodes(animeId.toString(), nextPage);
        
        // Update episodeToWatch with new episodes
        setEpisodeToWatch(prev => ({
          ...prev,
          [animeId]: {
            ...prev[animeId],
            allEpisodes: [...prev[animeId].allEpisodes, ...data.map((ep: { mal_id: number, title: string }) => ({ id: ep.mal_id, title: ep.title }))]
          }
        }));
      } catch (error) {
        console.error("Failed to fetch next page of episodes:", error);
      }
    }

    // Find the next episode using the potentially updated allEpisodes
    const updatedAnimeEpisodes = episodeToWatch[animeId]?.allEpisodes || [];
    const nextEpisode = updatedAnimeEpisodes.find(ep => ep.id > episodeId);

    if (nextEpisode) {
      // Update to the next episode
      setEpisodeToWatch(prev => ({
        ...prev,
        [animeId]: { ...prev[animeId], id: nextEpisode.id, title: nextEpisode.title }
      }));
    } else if (episodeId < totalEpisodes[animeId]) {
      // If we don't have information about the next episode, but we know there are more episodes
      setEpisodeToWatch(prev => ({
        ...prev,
        [animeId]: { ...prev[animeId], id: episodeId + 1, title: `Episode ${episodeId + 1}` }
      }));
    } else {
      // This was the last episode
      const animeToMove = watchList.find((anime: Anime) => anime.mal_id === animeId);
      if (animeToMove) {
        setFinishedList((prev: Anime[]) => [...prev, animeToMove]);
        setWatchList((prev: Anime[]) => prev.filter((anime: Anime) => anime.mal_id !== animeId));
        setEpisodeToWatch(prev => {
          const newState = { ...prev };
          delete newState[animeId];
          return newState;
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <TimerForm 
        setInitialDuration={setInitialDuration}
        setCurrentDuration={setCurrentDuration}
        setKey={setKey}
      />

      <div className="flex flex-col items-center">
        <TimerDisplay 
          key={key}
          isPlaying={isPlaying}
          currentDuration={currentDuration}
          setIsPlaying={setIsPlaying}
          // TODO: create a rest timer as well
          // default time is gonna be 20 minutes.
          // different colors for the timer
        />

        <TimerControls 
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          initialDuration={initialDuration}
          setCurrentDuration={setCurrentDuration}
          setKey={setKey}
        />
      </div>

      <EpisodeList 
        episodeToWatch={episodeToWatch}
        animeTitles={animeTitles}
        watchEpisode={watchEpisode}
      />
    </div>
  );
}