import Image from "next/image";
import Link from "next/link";
import Anime from "@/constants/Anime";

// Define props type for AnimeCard component
type AnimeCardProps = {
  anime: Anime;
};

// AnimeCard component to display anime information
export function AnimeCard({ anime }: AnimeCardProps) {
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
    </div>
  );
}