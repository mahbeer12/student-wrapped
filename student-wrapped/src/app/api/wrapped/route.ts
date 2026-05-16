export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { computeWeeklyStats, generateInsights } from "@/lib/insights";

// GET /api/wrapped - get weekly wrapped data for the current user
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ insights: [], stats: null, demo: true });
    }

    // Get last 7 days of check-ins
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    const { data: checkins, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", session.user.id)
      .gte("date", dateStr)
      .order("date", { ascending: true });

    if (error) throw error;

    const stats = computeWeeklyStats(checkins || []);
    const insights = generateInsights(checkins || [], stats);

    return NextResponse.json({ insights, stats, checkInCount: checkins?.length || 0 });
  } catch (error) {
    console.error("GET /api/wrapped error:", error);
    return NextResponse.json({ error: "Failed to generate Wrapped" }, { status: 500 });
  }
}
