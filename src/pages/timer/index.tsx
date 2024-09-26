import React, { useState, useCallback } from 'react';
import { useForm, SubmitHandler } from "react-hook-form";
import { useAtom } from "jotai";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { successToast, errorToast } from "@/things/Toast";
import { nextEpisodeAtom } from "@/atoms/episodeAtoms";
import { watchListAtom } from "@/atoms/animeAtoms";
import Anime from "@/constants/Anime";

// Define the type for the form inputs
type FormInputs = {
  time: number;
};

// Constants for time conversion
const SECONDS_PER_MINUTE = 60;
const DEFAULT_TIME = 40 * SECONDS_PER_MINUTE; // 40 minutes in seconds

export default function Timer() {
  // State for timer duration and play state
  const [duration, setDuration] = useState(DEFAULT_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  // Use atoms for next episode and watch list
  const [episodeToWatch] = useAtom(nextEpisodeAtom);
  const [watchList] = useAtom(watchListAtom);

  // Setup form with react-hook-form
  const { register, handleSubmit } = useForm<FormInputs>();

  // Memoize anime titles for easy access
  const animeTitles = React.useMemo(() => {
    return watchList.reduce((acc, anime: Anime) => {
      acc[anime.mal_id] = anime.title_english || anime.title_japanese || 'Unknown';
      return acc;
    }, {} as Record<number, string>);
  }, [watchList]);

  // Callback for starting the timer
  const handleStart = useCallback(() => {
    if (isPlaying) {
      errorToast("Already playing");
      return;
    }
    setIsPlaying(true);
    successToast("Start");
  }, [isPlaying]);

  // Callback for pausing the timer
  const handlePause = useCallback(() => {
    if (!isPlaying) {
      errorToast("Not playing");
      return;
    }
    setIsPlaying(false);
    successToast("Stop");
  }, [isPlaying]);

  // Callback for resetting the timer
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setDuration(DEFAULT_TIME);
    successToast("Timer reset");
  }, []);

  // Form submission handler
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const newDuration = data.time * SECONDS_PER_MINUTE;
    setDuration(newDuration);
    successToast(`Time set to ${data.time} minutes`);
  };

  // Function to format time in minutes and seconds
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <form className="flex flex-col items-center gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="number"
          {...register("time")}
          className="text-black text-center text-xl rounded-md w-40"
          placeholder="Minutes"
        />
        <button type="submit" className="bg-blue-500 text-white p-1 rounded-md w-40">
          Set Time
        </button>
      </form>

      <div className="flex flex-col items-center">
        {/* Timer component */}
        <CountdownCircleTimer
          key={duration}
          isPlaying={isPlaying}
          duration={duration}
          colors={["#004777", "#F7B825", "#A30000"]}
          colorsTime={[10, 5, 2]}
          onComplete={() => {
            setIsPlaying(false);
            return { shouldRepeat: false, delay: 1 };
          }}
        >
          {({ remainingTime }) => (
            <div className="text-4xl font-bold">{formatTime(remainingTime)}</div>
          )}
        </CountdownCircleTimer>

        {/* Timer control buttons */}
        <div className="flex gap-4 mt-4">
          <button onClick={handleStart} className="bg-green-500 text-white p-2 rounded-md">
            Start
          </button>
          <button onClick={handlePause} className="bg-yellow-500 text-white p-2 rounded-md">
            Pause
          </button>
          <button onClick={handleReset} className="bg-red-500 text-white p-2 rounded-md">
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Display next episode details */}
        <p className="font-bold mb-2">Next Episode:</p>
        <div className="flex flex-col items-center text-center">
          {Object.entries(episodeToWatch).map(([animeId, episode]) => (
            <p key={animeId}>
              <span className="font-semibold">{animeTitles[Number(animeId)] || animeId}:</span> 
              <br />
              {episode.id} - {episode.title}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}