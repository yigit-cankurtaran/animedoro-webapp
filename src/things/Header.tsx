import Link from "next/link";

export default function Header() {
  return (
    // TODO: in cases where the page is too long this stays on top
    // might make it sticky
    <header className="p-4">
      <Link className="text-blue-400 hover:text-blue-700" href="/">
        ⬅️ Home
      </Link>
    </header>
  );
}
