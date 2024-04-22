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
      <form onSubmit={onSubmit}>
        <label htmlFor="searchInput">
          Search anime:
          <input type="text" name="animeName" />
        </label>
        <input type="submit" value="Submit" />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          data && <p>{JSON.stringify(data.data[0])}</p>
          // this still returns an array, we can't parse this
          // i can create a new div and map through the array
          // displaying some of the data like title, image, etc.
        )}
      </form>
    </>
  );
  //   this will search for anime and display them
  //  we will use the Jikan API
  //   display a list of them
}
