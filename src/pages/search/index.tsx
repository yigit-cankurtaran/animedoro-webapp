import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Search() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // prevents the page from reloading
    const formData = new FormData(event.target as HTMLFormElement);
    // we need this for the type to be correct
    const animeName = formData.get("animeName");

    fetch(`https://api.jikan.moe/v4/anime?q=${animeName}`)
      // this might not be the best way to do this
      // i remember that the Jikan API has a search endpoint
      .then((response) => {
        if (response.ok) return response.json();
        else throw new Error("Failed to fetch");
      })
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setData({});
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <>
      <Link href="/">Home</Link>
      <form onSubmit={onSubmit}>
        <label htmlFor="searchInput">
          Search anime:
          <input type="text" name="animeName" />
        </label>
        <input type="submit" value="Submit" />
        <p>
          {isLoading
            ? "Loading..."
            : data && (
                <div>
                  {data.data.map((anime: any) => (
                    // this maps out every anime in the data
                    // i want only the first one
                    // maybe display the search results in a bento box?
                    <div key={anime.mal_id}>
                      <h3>{anime.title_english}</h3>
                      <p>{anime.title_japanese}</p>
                      <p>{anime.synopsis}</p>
                      <Image
                        src={anime.images.jpg.image_url}
                        alt={anime.title_english}
                        width={200}
                        height={300}
                      />
                    </div>
                  ))}
                </div>
              )}
        </p>
      </form>
    </>
  );
  //   this will search for anime and display them
  //  we will use the Jikan API
  //   display a list of them
}
