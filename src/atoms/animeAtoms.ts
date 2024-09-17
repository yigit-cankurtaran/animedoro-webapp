import { atomWithStorage } from 'jotai/utils';
import Anime from "@/constants/Anime";

export const watchListAtom = atomWithStorage<Anime[]>('watchList', []);
export const toWatchListAtom = atomWithStorage<Anime[]>('toWatchList', []);
export const finishedListAtom = atomWithStorage<Anime[]>('finishedList', []);