import { useAtom } from "jotai";
import { finishedListAtom } from "@/atoms/animeAtoms";
import { AnimeCard } from "@/things/AnimeCard";

export default function Finishlist() {
  const [finishedList] = useAtom(finishedListAtom);

  return (
    <div>
      <h1>Finished List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {finishedList.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </div>
  );
}