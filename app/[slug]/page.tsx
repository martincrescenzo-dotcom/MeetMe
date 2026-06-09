import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppURL } from "@/lib/utils";
import type { MeetMe } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const { data, error } = await supabase
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
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold">Meet {profile.name}</h1>

      <div className="flex flex-col gap-6">
        {categories.map((category, ci) => (
          <section key={ci} className="flex flex-col gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              {category.label}
            </h2>
            <ul className="flex flex-col gap-1">
              {category.items.map((item, ii) => (
                <li key={ii}>
                  <a
                    href={buildWhatsAppURL(profile.phone, item.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8 text-center text-muted">
        <Link href="/create" className="underline">
          Create a MeetMe
        </Link>
      </div>
    </div>
  );
}
