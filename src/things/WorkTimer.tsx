import React, { useEffect } from 'react';
import { CountdownCircleTimer } from "react-countdown-circle-timer";

interface WorkTimerProps {
  isPlaying: boolean;
  duration: number;
  onComplete: () => void;
  timerKey: number;
}

export const WorkTimer: React.FC<WorkTimerProps> = ({
  isPlaying,
  duration,
  onComplete,
  timerKey
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-blue-600">Work Timer</h2>
      <CountdownCircleTimer
        key={timerKey}
        isPlaying={isPlaying}
        duration={duration}
        colors={["#004777", "#F7B825", "#A30000"]}
        colorsTime={[duration * 0.6, duration * 0.3, 0]}
        onComplete={() => {
          onComplete();
          return { shouldRepeat: false, delay: 1 };
        }}
      >
        {({ remainingTime }) => (
          <div className="text-4xl font-bold">{formatTime(remainingTime)}</div>
        )}
      </CountdownCircleTimer>
    </div>
  );
};
