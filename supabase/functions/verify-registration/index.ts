import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing verification token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .select("registration_id, full_name, status, payment_status, event_name")
      .eq("qr_token", token)
      .maybeSingle();

    if (regError || !registration) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired verification token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch linked event
    const { data: regEvent } = await supabase
      .from("registration_events")
      .select("event_id")
      .eq("registration_id", (await supabase
        .from("registrations")
        .select("id")
        .eq("qr_token", token)
        .maybeSingle()
      ).data?.id)
      .maybeSingle();

    let eventName: string | null = null;
    if (regEvent?.event_id) {
      const { data: event } = await supabase
        .from("events")
        .select("name")
        .eq("id", regEvent.event_id)
        .maybeSingle();
      eventName = event?.name ?? null;
    }

    return new Response(
      JSON.stringify({
        valid: true,
        registration_id: registration.registration_id,
        full_name: registration.full_name,
        status: registration.status,
        payment_status: registration.payment_status,
        event_name: eventName,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
