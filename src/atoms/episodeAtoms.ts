import { atomWithStorage } from "jotai/utils";

export const watchedEpisodesAtom = atomWithStorage<{ [animeId: string]: number[] }>('watchedEpisodes', {});
export const totalEpisodesAtom = atomWithStorage<{ [animeId: string]: number }>('totalEpisodes', {});