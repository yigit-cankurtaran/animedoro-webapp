import { fetchEpisodes } from './episodeUtils';
import Anime from '@/constants/Anime';
import { successToast, errorToast } from '@/things/Toast';
import Episode from '@/constants/Episode';

export async function addToWatchlist(
  anime: Anime,
  watchlist: Anime[],
  setWatchlist: (updater: (prev: Anime[]) => Anime[]) => void,
  setTotalEpisodes: (updater: (prev: { [animeId: string]: number }) => { [animeId: string]: number }) => void
) {
  // Check if the anime is already in the watchlist
  if (watchlist.some(item => item.mal_id === anime.mal_id)) {
    errorToast(`${anime.title_english || anime.title_japanese} is already in your watchlist`);
    return;
  }

  // Add the anime to the watchlist
  setWatchlist((prev) => [...prev, anime]);

  // Fetch all episodes and set total episodes
  await fetchAllPagesAndSetTotalEpisodes(anime.mal_id.toString(), setTotalEpisodes);

  // Show success toast
  successToast(`${anime.title_english || anime.title_japanese} added to watchlist`);
}

export function removeFromWatchlist(
  anime: Anime,
  setWatchlist: (updater: (prev: Anime[]) => Anime[]) => void
) {
  // Remove the anime from the watchlist
  setWatchlist((prev) => prev.filter(item => item.mal_id !== anime.mal_id));
  // Show success toast
  successToast(`${anime.title_english || anime.title_japanese} removed from watchlist`);
}

async function fetchAllPagesAndSetTotalEpisodes(
  animeId: string,
  setTotalEpisodes: (updater: (prev: { [animeId: string]: number }) => { [animeId: string]: number }) => void
) {
  let allEpisodes: Episode[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data, pagination } = await fetchEpisodes(animeId, page);
    allEpisodes = [...allEpisodes, ...data];
    hasNextPage = pagination.has_next_page;
    page++;
  }

  const totalEpisodeCount = allEpisodes.length;
  setTotalEpisodes(prev => ({ ...prev, [animeId]: totalEpisodeCount }));
}
