import { removeTandAfter } from "@/utils/episodeUtils";
import Episode from "@/constants/Episode";

// Define props for EpisodeItem component
type EpisodeItemProps = {
  episode: Episode;
  isWatched: boolean;
  onToggleWatched: (episodeId: number) => void;
};

// EpisodeItem component to display individual episode information
export function EpisodeItem({ episode, isWatched, onToggleWatched }: EpisodeItemProps) {
  return (
    // Container for episode information
    <div className="flex text-center flex-col justify-center items-center m-10 bg-slate-900 p-5 rounded-3xl">
      {/* Display episode title */}
      <p>{episode.title}</p>
      {/* Display episode ID */}
      <p>{episode.mal_id}</p>
      {/* Display formatted air date */}
      <p>{removeTandAfter(episode.aired)}</p>
      {/* Show if episode is filler */}
      <p>{episode.filler ? "Filler" : ""}</p>
      {/* Show if episode is recap */}
      <p>{episode.recap ? "Recap" : ""}</p>
      {/* Button to toggle watched status */}
      <button
        onClick={() => onToggleWatched(episode.mal_id)}
        className={`${
          isWatched
            ? "bg-green-500 hover:text-gray-500"
            : "bg-gray-500 hover:text-blue-300"
        } px-3 py-1 rounded-full mt-2`}
      >
        {isWatched ? "Watched" : "Mark as Watched"}
      </button>
    </div>
  );
}