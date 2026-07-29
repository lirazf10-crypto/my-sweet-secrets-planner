import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const ALLOWED_TABLES = new Set([
    "orders",
    "home_tasks",
    "kitchen_experiments",
    "kitchen_routine_tasks",
    "office_tasks",
    "promotion_tasks",
    "workshop_plan_ideas",
    "content_items",
  ]);

  try {
    const body = await req.json();
    // Orders keep their original request shape for backward compatibility.
    // Every other table sends { table, id, title, dueDate, startTime, endTime }.
    const table: string = body.table ?? "orders";
    if (!ALLOWED_TABLES.has(table)) {
      return new Response(JSON.stringify({ error: "Unknown table" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const recordId: string = table === "orders" ? body.orderId : body.id;
    const summaryText: string = table === "orders" ? `הזמנה: ${body.description}` : body.title;
    const deliveryDate: string = table === "orders" ? body.deliveryDate : body.dueDate;
    const { startTime, endTime } = body;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: tokenRow } = await supabaseAdmin
      .from('google_calendar_tokens')
      .select('refresh_token')
      .limit(1)
      .maybeSingle();

    if (!tokenRow) {
      return new Response(JSON.stringify({ error: 'Google Calendar not connected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: tokenRow.refresh_token,
        grant_type: 'refresh_token',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return new Response(JSON.stringify({ error: 'Token refresh failed', detail: tokenData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const accessToken = tokenData.access_token;

    const hasTime = !!startTime;
    const event: Record<string, unknown> = {
      summary: summaryText,
    };
    if (hasTime) {
      event.start = { dateTime: `${deliveryDate}T${startTime}:00`, timeZone: 'Asia/Jerusalem' };
      event.end = { dateTime: `${deliveryDate}T${endTime || startTime}:00`, timeZone: 'Asia/Jerusalem' };
    } else {
      event.start = { date: deliveryDate };
      event.end = { date: deliveryDate };
    }

    const { data: sourceRow } = await supabaseAdmin
      .from(table)
      .select('google_event_id')
      .eq('id', recordId)
      .maybeSingle();

    const existingEventId = sourceRow?.google_event_id;
    const calRes = existingEventId
      ? await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEventId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        })
      : await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

    const calData = await calRes.json();
    if (!calRes.ok) {
      return new Response(JSON.stringify({ error: 'Calendar API failed', detail: calData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!existingEventId) {
      await supabaseAdmin.from(table).update({ google_event_id: calData.id }).eq('id', recordId);
    }

    return new Response(JSON.stringify({ success: true, eventId: calData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
