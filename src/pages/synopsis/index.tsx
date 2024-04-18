import { useState, useEffect } from "react";
import Link from "next/link";

export default function Synopsis() {
  const [data, setData] = useState([]);
  const [synopsis, setSynopsis] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.jikan.moe/v4/anime?q=Fate/Zero")
      // gets data from the Jikan API
      .then((response) => response.json())
      // the above line converts the response to JSON
      // .then((data) => setData(data));
      .then((data) => {
        setData(data);
        setSynopsis(data.data[0].synopsis);
        // this works, we need to get the first element of the array
        // it returns an array of objects, we need to get the first object
      })
      .finally(() => {
        setIsLoading(false);
        // when we get the data, we set isLoading to false
      });
  }, []);

  return (
    <>
      <Link href="/">Home</Link>
      <h1>
        {isLoading
          ? "Loading..."
          : data && <div>{JSON.parse(JSON.stringify(synopsis))}</div>}
      </h1>
    </>
  );
  //   parse cleans up the JSON data
}
