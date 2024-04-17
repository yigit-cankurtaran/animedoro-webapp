import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);
  const [synopsis, setSynopsis] = useState("");

  useEffect(() => {
    fetch("https://api.jikan.moe/v4/anime?q=Fate/Zero")
      // gets data from the Jikan API
      .then((response) => response.json())
      // the above line converts the response to JSON
      // .then((data) => setData(data));
      .then((data) => {
        setData(data);
        setSynopsis(data.data[0].synopsis);
      });
    // the above line sets the data to the state
  }, []);

  return (
    <>
      <h1>hello world!</h1>
      {data && <div>{JSON.stringify(synopsis)}</div>}
    </>
  );
}
