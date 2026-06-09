import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold">MeetMe</h1>
      <p className="mt-4 text-muted">A profile card you can share.</p>
      <Link
        href="/create"
        className="mt-8 underline"
      >
        Create a MeetMe
      </Link>
    </div>
  );
}
