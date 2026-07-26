import { useEffect, useState } from "react";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function GoogleCalendarConnect() {
  const [linked, setLinked] = useState<boolean | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    supabase.auth.getUserIdentities().then(({ data }) => {
      setLinked(!!data?.identities.some((i) => i.provider === "google"));
    });
  }, []);

  const connect = async () => {
    setConnecting(true);
    await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar.events",
        queryParams: { access_type: "offline", prompt: "consent" },
        redirectTo: window.location.origin,
      },
    });
  };

  if (linked === null) return null;

  if (linked) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground" title="מחוברת ליומן גוגל">
        <CalendarCheck className="w-4 h-4 text-primary" />
        יומן מחובר
      </span>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={connect} disabled={connecting}>
      <CalendarPlus className="w-4 h-4" />
      חיבור ליומן גוגל
    </Button>
  );
}
