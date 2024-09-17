import { useAtom } from 'jotai';
import { watchListAtom } from '@/atoms/animeAtoms';
import Image from "next/image";
import Link from "next/link";
import Anime from "@/constants/Anime";
import { successToast, errorToast } from './Toast';
import { watchedEpisodesAtom, totalEpisodesAtom } from '@/atoms/episodeAtoms';

// Define props type for AnimeCard component
type AnimeCardProps = {
  anime: Anime;
};

export function AnimeCard({ anime }: AnimeCardProps) {
  const [watchlist, setWatchlist] = useAtom(watchListAtom);
  const [watchedEpisodes, setWatchedEpisodes] = useAtom(watchedEpisodesAtom);
  const [totalEpisodes, setTotalEpisodes] = useAtom(totalEpisodesAtom);

  const onAddToWatch = () => {
    if (watchlist.some(item => item.mal_id === anime.mal_id)) {
      errorToast(`${anime.title_english || anime.title_japanese} is already in your watchlist`);
      return;
    }

    setWatchlist((prev) => [...prev, anime]);
    successToast(`${anime.title_english || anime.title_japanese} added to watchlist`);
  };

  return (
    // Container for the anime card
    <div className="flex flex-col justify-center items-center bg-slate-900 p-3 rounded-3xl">
      {/* Link to anime episodes page */}
      <Link
        className="text-bold text-pretty text-start text-2xl text-blue-300 m-1"
        href={`/episodes/${anime.mal_id}`}
      >
        {/* Display English title if available, otherwise Japanese title */}
        {anime.title_english || anime.title_japanese}
      </Link>
      {/* Display Japanese title if English title is available */}
      {anime.title_english && (
        <p className="m-1">{anime.title_japanese}</p>
      )}
      {/* Display anime synopsis */}
      <p className="m-1 text-center">{anime.synopsis}</p>
      {/* Display anime image */}
      <Image
        src={anime.images.jpg.image_url}
        alt={anime.title_english || anime.title_japanese}
        width={200}
        height={300}
        style={{ objectFit: "contain" }}
        className="m-1"
      />
      {/* Display status button based on anime's finished and watching state */}
      {!watchlist.some(item => item.mal_id === anime.mal_id) && (
        <button onClick={onAddToWatch} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full mt-2">
          Add to Watch
        </button>
      )}
      {watchlist.some(item => item.mal_id === anime.mal_id) && (
        <div className="flex flex-row">
          <span className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-full mt-2">
            In Watchlist
          </span>
          <span className="bg-green-500 text-black font-bold py-2 px-4 rounded-full mt-2">
            {watchedEpisodes[anime.mal_id]?.length || 0} / {totalEpisodes[anime.mal_id] || 0}
          </span>
        </div>
      )}
    </div>
  );
}