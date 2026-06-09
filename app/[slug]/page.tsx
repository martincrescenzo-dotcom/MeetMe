import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { buildWhatsAppURL } from "@/lib/utils";
import type { MeetMe } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const { data, error } = await getSupabase()
    .from("meetme")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const profile = data as MeetMe;
  const categories = (profile.data ?? []).filter(
    (c) => c.items && c.items.length > 0
  );

  return (
    <div>
      <h1 className="m-0 mb-[46px] text-[30px] font-normal leading-[1.1] tracking-[-0.01em] text-ink">
        Meet {profile.name}
      </h1>

      <div className="flex flex-col gap-[30px]">
        {categories.map((category, ci) => (
          <section key={ci}>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-ink">
              {category.label}
            </div>
            <div className="flex flex-col">
              {category.items.map((item, ii) => (
                <a
                  key={ii}
                  href={buildWhatsAppURL(profile.phone, item.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-baseline gap-[9px] py-[10px] text-[17px] leading-[1.3] text-ink"
                >
                  <span className="shrink-0 select-none text-muted">·</span>
                  <span className="underline decoration-1 underline-offset-[3px]">
                    {item.name}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-divider pt-5 text-center">
        <Link
          href="/create"
          className="text-[12px] tracking-[0.03em] text-muted"
        >
          Create a MeetMe
        </Link>
      </div>
    </div>
  );
}
