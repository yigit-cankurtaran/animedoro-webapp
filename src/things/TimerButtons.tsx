export function TimerButtons({ handleStart, handleStop, handleReset }: { handleStart: () => void, handleStop: () => void, handleReset: () => void }) {
    return (
        <div className="flex flex-col justify-center items-center gap-4">
            <button className="bg-blue-500 text-white p-2 rounded-md w-40" onClick={handleStart}>
                Start
                </button>
                <button className="bg-red-500 text-white p-2 rounded-md w-40" onClick={handleStop}>
                    Stop
                </button>
                <button className="bg-yellow-500 text-white p-2 rounded-md w-40" onClick={handleReset}>
                    Reset
                </button>
        </div>
    );
}