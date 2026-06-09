import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="m-0 mb-6 text-[24px] font-normal tracking-[-0.01em] text-ink">
        Not found.
      </h1>
      <Link
        href="/create"
        className="text-[12px] tracking-[0.03em] text-muted underline underline-offset-2"
      >
        Create a MeetMe
      </Link>
    </div>
  );
}
