import React from 'react';
import Link from 'next/link';

interface EpisodeListProps {
  episodeToWatch: { [animeId: string]: { id: number, title: string, allEpisodes: { id: number, title: string }[] } };
  animeTitles: Record<number, string>;
  watchEpisode: (animeId: number, episodeId: number) => void;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({ episodeToWatch, animeTitles, watchEpisode }) => {
  return (
    <div className="flex flex-col items-center">
      <p className="font-bold mb-2">Next Episodes:</p>
      <div className="flex flex-col items-center text-center">
        {Object.entries(episodeToWatch).map(([animeId, episodeInfo]) => (
            // entries is an array of [animeId, episodeInfo]
          <div key={animeId}>
            <p>
              {/* Link to the anime's episodes page */}
              <Link href={`/episodes/${animeId}`} className="font-semibold hover:underline text-blue-500">
                {animeTitles[Number(animeId)] || animeId}
              </Link> 
              <br />
              {/* Display the episode number and title */}
              {episodeInfo.id} - {episodeInfo.title}
              {/* Button to mark the episode as watched */}
              <button className="bg-blue-500 text-white p-1 rounded-md ml-2" onClick={() => watchEpisode(Number(animeId), episodeInfo.id)}>
                +
              </button>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
