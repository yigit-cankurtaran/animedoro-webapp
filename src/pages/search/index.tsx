import { ClipLoader } from "react-spinners";
import { useAnimeSearch } from "@/hooks/useAnimeSearch";
import { SearchForm } from "@/things/SearchForm";
import { AnimeCard } from "@/things/AnimeCard";

export default function Search() {
  // Use custom hook to manage anime search state and functionality
  const {
    isLoading,
    isError,
    animeData,
    error,
    searchPerformed,
    setSearchPerformed,
    debouncedSetSearchQuery,
  } = useAnimeSearch();

  // called when we submit the search
  const handleSearch = (query: string) => {
    setSearchPerformed(true);
    debouncedSetSearchQuery(query);
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Search Section */}
      <div className="bg-slate-700/50 backdrop-blur-sm sticky top-0 z-10 p-4 shadow-lg">
        <SearchForm onSearch={handleSearch} />
      </div>

      {/* Content Section */}
      <div className="flex-grow p-4 container mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
            <ClipLoader color="#60A5FA" loading={isLoading} size={60} />
            <p className="text-slate-400 animate-pulse">Searching for anime...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-6 max-w-md w-full text-center">
              <p className="text-red-400 font-medium">
                Error: {(error as Error).message}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Please try again or check your connection
              </p>
            </div>
          </div>
        ) : animeData.length > 0 ? (
          <div className="space-y-6">
            <p className="text-slate-400 text-sm">
              Found {animeData.length} results
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {animeData.map((anime) => (
                <div className="transform hover:scale-[1.02] transition-transform duration-200">
                  <AnimeCard key={anime.mal_id} anime={anime} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          searchPerformed && (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
              <div className="bg-slate-700 rounded-lg p-6 max-w-md w-full text-center">
                <p className="text-lg font-medium">No results found</p>
                <p className="text-slate-400 text-sm mt-2">
                  Try adjusting your search terms or try a different title
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
