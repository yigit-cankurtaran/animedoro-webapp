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
      {/* Render search form component */}
      <SearchForm onSearch={handleSearch} />

      <div className="flex-grow p-4">
        {isLoading ? (
          // Show loading spinner while fetching data
          <div className="flex justify-center items-center h-full">
            <ClipLoader color="#ffffff" loading={isLoading} size={150} />
          </div>
        ) : isError ? (
          // Display error message if fetch fails
          <p className="text-center">Error: {(error as Error).message}</p>
        ) : animeData.length > 0 ? (
          // Render grid of anime cards if data is available
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {animeData.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        ) : (
          // Show "No data found" message if search performed but no results
          searchPerformed && animeData.length === 0 && <p className="text-center">No data found.</p>
        )}
      </div>
    </div>
  );
}
