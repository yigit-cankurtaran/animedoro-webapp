interface Episode {
    mal_id: number,
    synopsis: string,
    filler: boolean,
    recap: boolean,
    aired: string,
    score: number,
    title: string,
    title_japanese: string,
    url: string
    watched?: boolean
    // optional property to check if episode is watched
}

export default Episode;
// i may need to add a finished variable for this