import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-xl font-bold">Not found.</h1>
      <Link href="/create" className="mt-6 underline">
        Create a MeetMe
      </Link>
    </div>
  );
}
