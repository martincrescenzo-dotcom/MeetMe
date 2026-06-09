import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getBaseUrl, normalizePhone } from "@/lib/utils";
import type { MeetMeCategory } from "@/lib/types";

export const runtime = "nodejs";

type UpdateBody = {
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

export async function PUT(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: existing, error: lookupError } = await supabase
    .from("meetme")
    .select("id, slug")
    .eq("edit_token", token)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json(
      { error: lookupError.message },
      { status: 500 }
    );
  }
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let body: UpdateBody;
  try {
    body = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "Name must be a non-empty string." },
        { status: 400 }
      );
    }
    patch.name = body.name.trim();
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== "string" || !body.phone.trim()) {
      return NextResponse.json(
        { error: "Phone must be a non-empty string." },
        { status: 400 }
      );
    }
    patch.phone = normalizePhone(body.phone);
  }

  if (body.data !== undefined) {
    const categories = validateCategories(body.data);
    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: "At least one category with one item is required." },
        { status: 400 }
      );
    }
    patch.data = categories;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "No fields to update." },
      { status: 400 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("meetme")
    .update(patch)
    .eq("edit_token", token)
    .select("slug")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Update failed." },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(req);
  const share_url = `${baseUrl}/${updated.slug}`;

  return NextResponse.json({
    slug: updated.slug,
    share_url,
  });
}
