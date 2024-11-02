import { useAtom } from "jotai";
import { finishedListAtom } from "@/atoms/animeAtoms";
import { AnimeCard } from "@/things/AnimeCard";
import { CheckCircle } from "lucide-react";

export default function Finishlist() {
  const [finishedList] = useAtom(finishedListAtom);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-400/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Finished List
            </h1>
          </div>
          <div className="text-sm text-slate-400">
            {finishedList.length} {finishedList.length === 1 ? 'anime' : 'animes'} completed
          </div>
        </div>

        {/* Content Section */}
        {finishedList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishedList.map((anime) => (
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
              <div className="bg-green-400/10 p-3 rounded-full w-fit mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">No completed anime yet</h2>
              <p className="text-slate-400">
                Anime you've finished watching will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

