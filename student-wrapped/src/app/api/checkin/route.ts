
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// GET /api/checkin - fetch all check-ins for the current user
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Return demo data for unauthenticated users
      return NextResponse.json({ checkins: [], demo: true });
    }

    const { data: checkins, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", session.user.id)
      .order("date", { ascending: false })
      .limit(90); // 3 months max

    if (error) throw error;
    return NextResponse.json({ checkins });
  } catch (error) {
    console.error("GET /api/checkin error:", error);
    return NextResponse.json({ checkins: [], error: "Failed to load" }, { status: 500 });
  }
}

// POST /api/checkin - save a new check-in
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    const body = await req.json();
    const { sleep_hours, stress_level, study_minutes, academic_load, energy_level, date } = body;

    // Validate fields
    if (
      typeof sleep_hours !== "number" ||
      typeof stress_level !== "number" ||
      typeof study_minutes !== "number" ||
      typeof academic_load !== "number" ||
      typeof energy_level !== "number" ||
      !date
    ) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    if (!session) {
      // For demo users, just return success without saving
      return NextResponse.json({ success: true, demo: true });
    }

    // Upsert by (user_id, date) so one check-in per day
    const { data, error } = await supabase
      .from("checkins")
      .upsert({
        user_id: session.user.id,
        date,
        sleep_hours: Math.min(12, Math.max(0, sleep_hours)),
        stress_level: Math.min(10, Math.max(1, stress_level)),
        study_minutes: Math.min(720, Math.max(0, study_minutes)),
        academic_load: Math.min(10, Math.max(0, academic_load)),
        energy_level: Math.min(10, Math.max(1, energy_level)),
      }, { onConflict: "user_id,date" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, checkin: data });
  } catch (error) {
    console.error("POST /api/checkin error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
