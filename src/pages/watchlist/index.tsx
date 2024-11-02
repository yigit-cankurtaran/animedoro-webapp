import { useAtom } from "jotai";
import { watchListAtom } from "@/atoms/animeAtoms";
import { AnimeCard } from "@/things/AnimeCard";
import { List } from "lucide-react";

export default function Watchlist() {
  const [watchlist] = useAtom(watchListAtom);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-400/10 rounded-lg">
              <List className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Watchlist
            </h1>
          </div>
          <div className="text-sm text-slate-400">
            {watchlist.length} {watchlist.length === 1 ? 'anime' : 'animes'}
          </div>
        </div>

        {/* Content Section */}
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((anime) => (
              <div
                key={anime.mal_id}
                className="transform hover:scale-[1.02] transition-all duration-200 hover:shadow-lg"
              >
                <AnimeCard anime={anime} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-slate-700 rounded-lg p-8 max-w-md w-full text-center space-y-4">
              <div className="bg-blue-400/10 p-3 rounded-full w-fit mx-auto">
                <List className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Your watchlist is empty</h2>
              <p className="text-slate-400">
                Start adding anime to your watchlist by searching for your favorite titles
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

