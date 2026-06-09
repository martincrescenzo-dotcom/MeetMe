import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  generateEditToken,
  generateSlug,
  getBaseUrl,
  normalizePhone,
} from "@/lib/utils";
import type { MeetMeCategory } from "@/lib/types";

export const runtime = "nodejs";

type CreateBody = {
  name?: unknown;
  phone?: unknown;
  data?: unknown;
};

function validateCategories(input: unknown): MeetMeCategory[] | null {
  if (!Array.isArray(input)) return null;
  const out: MeetMeCategory[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const cat = raw as { label?: unknown; items?: unknown };
    if (typeof cat.label !== "string" || !cat.label.trim()) return null;
    if (!Array.isArray(cat.items)) return null;
    const items = [];
    for (const it of cat.items) {
      if (!it || typeof it !== "object") return null;
      const item = it as { name?: unknown; message?: unknown };
      if (
        typeof item.name !== "string" ||
        typeof item.message !== "string" ||
        !item.name.trim() ||
        !item.message.trim()
      ) {
        return null;
      }
      items.push({ name: item.name.trim(), message: item.message.trim() });
    }
    if (items.length === 0) return null;
    out.push({ label: cat.label.trim(), items });
  }
  return out;
}

export async function POST(req: Request) {
  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (typeof body.phone !== "string" || !body.phone.trim()) {
    return NextResponse.json({ error: "Phone is required." }, { status: 400 });
  }

  const categories = validateCategories(body.data);
  if (!categories || categories.length === 0) {
    return NextResponse.json(
      { error: "At least one category with one item is required." },
      { status: 400 }
    );
  }

  const name = body.name.trim();
  const phone = normalizePhone(body.phone);
  const edit_token = generateEditToken();

  let slug = "";
  let inserted = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    slug = generateSlug(name);
    const { data, error } = await getSupabase()
      .from("meetme")
      .insert({
        slug,
        name,
        phone,
        data: categories,
        edit_token,
      })
      .select("slug, edit_token")
      .single();

    if (!error && data) {
      inserted = data;
      break;
    }

    lastError = error;
    // 23505 = unique_violation
    if (error && (error as { code?: string }).code !== "23505") {
      break;
    }
  }

  if (!inserted) {
    const message =
      (lastError as { message?: string } | null)?.message ?? "Insert failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const baseUrl = getBaseUrl(req);
  const share_url = `${baseUrl}/${inserted.slug}`;
  const edit_url = `${baseUrl}/edit/${inserted.edit_token}`;

  return NextResponse.json({
    slug: inserted.slug,
    edit_token: inserted.edit_token,
    share_url,
    edit_url,
  });
}
