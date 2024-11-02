import { useAtom } from "jotai";
import { watchListAtom } from "@/atoms/animeAtoms";
import { AnimeCard } from "@/things/AnimeCard";

export default function Watchlist() {
  const [watchlist] = useAtom(watchListAtom);

  if (watchlist.length === 0) return <div>Your watchlist is empty</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold justify-self-center mb-4">Watchlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {watchlist.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </div>
  );
}
