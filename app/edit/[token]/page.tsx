import { notFound } from "next/navigation";
import MeetMeForm from "@/components/MeetMeForm";
import { supabase } from "@/lib/supabase";
import type { MeetMe } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: { token: string };
}) {
  const { data, error } = await supabase
    .from("meetme")
    .select("*")
    .eq("edit_token", params.token)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const profile = data as MeetMe;

  return (
    <MeetMeForm
      mode="edit"
      token={profile.edit_token}
      initialName={profile.name}
      initialPhone={profile.phone}
      initialData={profile.data}
    />
  );
}
