import React from 'react';
import { CountdownCircleTimer } from "react-countdown-circle-timer";

interface TimerDisplayProps {
  key: number;
  isPlaying: boolean;
  currentDuration: number;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ key, isPlaying, currentDuration, setIsPlaying }) => {
  // format the time to be displayed in the timer
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <CountdownCircleTimer
      key={key} // Use key to force re-render
      isPlaying={isPlaying}
      duration={currentDuration}
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
  );
};
