import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://api.jikan.moe/v4/anime?q=Fate/Zero")
      // gets data from the Jikan API
      .then((response) => response.json())
      // the above line converts the response to JSON
      .then((data) => setData(data));
    // the above line sets the data to the state
  }, []);

  return (
    <>
      <h1>hello world!</h1>
      {data && <div>{JSON.stringify(data)}</div>}
    </>
  );
}
