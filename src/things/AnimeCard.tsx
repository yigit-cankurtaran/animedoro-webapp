import Image from "next/image";
import Link from "next/link";
import Anime from "@/constants/Anime";

// Define props type for AnimeCard component
type AnimeCardProps = {
  anime: Anime;
  onAddToWatch: (mal_id: number) => void;
};

// AnimeCard component to display anime information
export function AnimeCard({ anime, onAddToWatch }: AnimeCardProps) {
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
      {!anime.finished && !anime.watching && (
        <button onClick={() => onAddToWatch(anime.mal_id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full mt-2">
          Add to Watch
        </button>
      )}
      {anime.finished && (
        <span className="bg-green-500 text-white font-bold py-2 px-4 rounded-full mt-2">
          Finished
        </span>
      )}
      {anime.watching && !anime.finished && (
        <span className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-full mt-2">
          Watching
        </span>
      )}
    </div>
  );
}