"use client";
import { useState } from "react";

export default function Search() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // prevents the page from reloading
    const formData = new FormData(event.target as HTMLFormElement);
    // we need this for the type to be correct
    const animeName = formData.get("animeName");

    fetch(`https://api.jikan.moe/v4/anime?q=${animeName}`)
      // this might not be the best way to do this
      // i remember that the Jikan API has a search endpoint
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setData(data);
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
        {isLoading ? <p>Loading...</p> : <p>{JSON.stringify(data)}</p>}
      </form>
    </>
  );
  //   this will search for anime and display them
  //  we will use the Jikan API
  //   display a list of them
}
