import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>hello world!</h1>
      <Link href="/synopsis">Synopsis</Link>
      <Link href="/search">Search</Link>
    </>
  );
}
// TODO: make search bar
