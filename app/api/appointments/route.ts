import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*");

    if (error) {
      return Response.json({ error: error.message });
    }

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: "Fetch failed" });
  }
}