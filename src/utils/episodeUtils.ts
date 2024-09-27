// Load watched episodes from localStorage
export function loadWatchedEpisodes(animeId: string) {
    if (typeof window !== "undefined") {
      const storedWatchedEpisodes = localStorage.getItem(`watchedEpisodes_${animeId}`);
      return storedWatchedEpisodes ? JSON.parse(storedWatchedEpisodes) : {};
    }
    return {};
  }
  
// Save watched episodes to localStorage
export function saveWatchedEpisodes(animeId: string, watchedEpisodes: { [key: number]: boolean }) {
    localStorage.setItem(`watchedEpisodes_${animeId}`, JSON.stringify(watchedEpisodes));
  }
  
// Remove time from date string
export function removeTandAfter(date: string) {
  if (date) {
    return date.split("T")[0];
  }
  return "";
}
  
// Fetch episodes from API
export async function fetchEpisodes(animeId: string, page: number) {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes?page=${page}`);
    if (!response.ok) throw new Error("Failed to fetch");
    const result = await response.json();
    const { data, pagination } = result;
    return { data, pagination };
  }