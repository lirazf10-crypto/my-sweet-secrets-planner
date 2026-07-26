import { useEffect, useState } from "react";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function GoogleCalendarConnect() {
  const [linked, setLinked] = useState<boolean | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    supabase
      .from("google_calendar_tokens")
      .select("id")
      .limit(1)
      .then(({ data }) => {
        setLinked(!!data && data.length > 0);
      });

    const urlHasOAuthStuff = window.location.search.includes("code") || window.location.hash.length > 1;
    if (urlHasOAuthStuff) {
      setDebugInfo(`URL at load: search="${window.location.search}" hash="${window.location.hash}"`);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!urlHasOAuthStuff && event !== "SIGNED_IN") return;
      const extra = session as unknown as { provider_token?: string; provider_refresh_token?: string };
      setDebugInfo(
        (prev) =>
          `${prev ? prev + " | " : ""}event=${event} hasProviderToken=${!!extra?.provider_token} hasProviderRefreshToken=${!!extra?.provider_refresh_token}`
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  const connect = async () => {
    setConnecting(true);
    setError("");
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: { access_type: "offline", prompt: "consent" },
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
      setConnecting(false);
    }
  };

  if (linked === null) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      {linked ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground" title="מחוברת ליומן גוגל">
          <CalendarCheck className="w-4 h-4 text-primary" />
          יומן מחובר
        </span>
      ) : (
        <Button variant="outline" size="sm" onClick={connect} disabled={connecting}>
          <CalendarPlus className="w-4 h-4" />
          חיבור ליומן גוגל
        </Button>
      )}
      {error && <p className="text-xs text-destructive max-w-[240px] text-left" dir="ltr">{error}</p>}
      {debugInfo && (
        <p className="text-[10px] text-muted-foreground max-w-[280px] text-left break-all" dir="ltr">
          {debugInfo}
        </p>
      )}
    </div>
  );
}
