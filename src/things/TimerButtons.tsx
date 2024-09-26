export function TimerButtons({ handleStart, handlePause }: { handleStart: () => void, handlePause: () => void }) {
    return (
        <div className="flex flex-col justify-center items-center gap-4">
            <button className="bg-blue-500 text-white p-2 rounded-md w-40" onClick={handleStart}>
                Start
                </button>
                <button className="bg-red-500 text-white p-2 rounded-md w-40" onClick={handlePause}>
                    Pause
                </button>
        </div>
    );
}