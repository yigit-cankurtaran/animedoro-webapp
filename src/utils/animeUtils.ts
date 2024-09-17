import Anime from "@/constants/Anime";

export function saveToWatchList(anime: Anime) {
    localStorage.setItem("toWatchList", JSON.stringify(anime));
}

export function getToWatchList() {
    return localStorage.getItem("toWatchList");
}