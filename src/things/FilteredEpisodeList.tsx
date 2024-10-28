import React from 'react';
import Link from 'next/link';
import Anime from "@/constants/Anime";

type Episode = {
  id: number;
  title: string;
  allEpisodes: {
    id: number;
    title: string;
  }[];
};

type Episodes = {
  [animeId: string]: Episode;
};

type AnimeTitles = {
  [animeId: number]: string;
};

interface FilteredEpisodeListProps {
  episodeToWatch: Episodes;
  animeTitles: AnimeTitles;
  watchList: Anime[];
  watchEpisode: (animeId: number, episodeId: number) => void;
}

const FilteredEpisodeList = ({
  episodeToWatch,
  animeTitles,
  watchList,
  watchEpisode
}: FilteredEpisodeListProps) => {
  // Filter episodes to only show anime that are in the watch list
  const activeEpisodes = Object.entries(episodeToWatch).reduce<Episodes>((acc, [animeId, episode]) => {
    if (watchList.some(anime => anime.mal_id === parseInt(animeId))) {
      acc[animeId] = episode;
    }
    return acc;
  }, {});

  if (Object.keys(activeEpisodes).length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No episodes to watch right now
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {Object.entries(activeEpisodes).map(([animeId, episode]) => (
        <div
          key={animeId}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 bg-white/5 rounded-lg"
        >
          <div>
            <Link
              href={`/anime/${animeId}`}
              className="font-medium hover:text-blue-400 transition-colors"
            >
              {animeTitles[parseInt(animeId)]}
            </Link>
            <p className="text-sm text-gray-400">Episode {episode.id}: {episode.title}</p>
          </div>
          <button
            onClick={() => watchEpisode(parseInt(animeId), episode.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            Mark as Watched
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilteredEpisodeList;
