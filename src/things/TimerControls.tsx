import React from 'react';
import { successToast, errorToast } from "@/things/Toast";

interface TimerControlsProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  initialDuration: number;
  setCurrentDuration: React.Dispatch<React.SetStateAction<number>>;
  setKey: React.Dispatch<React.SetStateAction<number>>;
}

export const TimerControls: React.FC<TimerControlsProps> = ({ 
  isPlaying, setIsPlaying, initialDuration, setCurrentDuration, setKey 
}) => {
  // start the timer
  const handleStart = () => {
    if (isPlaying) {
      errorToast("Already playing");
      return;
    }
    setIsPlaying(true);
    successToast("Start");
  };

  // pause the timer
  const handlePause = () => {
    if (!isPlaying) {
      errorToast("Not playing");
      return;
    }
    setIsPlaying(false);
    successToast("Pause");
  };

  // stop the timer and reset it
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentDuration(initialDuration); // Reset to initial duration
    setKey(prevKey => prevKey + 1); // Increment key to force re-render
    successToast("Timer stopped and reset");
  };

  return (
    <div className="flex gap-4 mt-4">
      <button onClick={handleStart} className="bg-green-500 text-white p-2 rounded-md">
        Start
      </button>
      <button onClick={handlePause} className="bg-yellow-500 text-white p-2 rounded-md">
        Pause
      </button>
      <button onClick={handleStop} className="bg-red-500 text-white p-2 rounded-md">
        Stop
      </button>
    </div>
  );
};
