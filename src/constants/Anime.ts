interface Anime {
  mal_id: number;
  title_english: string;
  title_japanese: string;
  synopsis: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

export default Anime;