import { useState } from "react";
import { Sun, SunDim } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useWakeLock } from "@/hooks/useWakeLock";
import { Button } from "@/components/ui/button";
import OrdersPanel from "@/components/OrdersPanel";
import PromotionPanel from "@/components/PromotionPanel";
import ContentPanel from "@/components/ContentPanel";
import KitchenPanel from "@/components/KitchenPanel";
import HomePanel from "@/components/HomePanel";
import WorkshopsPanel from "@/components/WorkshopsPanel";
import OverviewPanel from "@/components/OverviewPanel";
import GoogleCalendarConnect from "@/components/GoogleCalendarConnect";

const PROJECTS = [
  { id: "orders", label: "הזמנות", ready: true },
  { id: "content", label: "תוכן", ready: true },
  { id: "workshops", label: "סדנאות", ready: true },
  { id: "promotion", label: "קידום העסק", ready: true },
  { id: "kitchen", label: "מטבח", ready: true },
  { id: "home", label: "בית", ready: true },
] as const;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("orders");
  const { signOut } = useAuth();
  const { isActive: wakeLockActive, toggle: toggleWakeLock } = useWakeLock();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <img src={logo} alt="סודות מתוקים" width={60} height={60} className="rounded-full" />
          <div className="flex-1">
            <h1 className="text-lg font-heading font-bold leading-tight">סודות מתוקים</h1>
            <p className="text-sm text-muted-foreground leading-tight">הסדר שלי</p>
          </div>
          <GoogleCalendarConnect />
          <Button
            variant={wakeLockActive ? "default" : "outline"}
            size="icon"
            onClick={toggleWakeLock}
            title={wakeLockActive ? "המסך יישאר דלוק" : "השאירי מסך דלוק"}
          >
            {wakeLockActive ? <Sun className="w-5 h-5" /> : <SunDim className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            יציאה
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <OverviewPanel />
        <div className="border-t border-border" />
        <div className="flex flex-wrap gap-2">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              disabled={!p.ready}
              onClick={() => p.ready && setActiveTab(p.id)}
              className={`rounded-lg border px-3.5 py-1.5 text-sm transition-colors ${
                activeTab === p.id
                  ? "border-primary bg-primary/10 font-medium text-primary"
                  : p.ready
                    ? "border-border text-foreground hover:bg-muted"
                    : "border-border text-muted-foreground cursor-not-allowed opacity-60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="pt-2">
          {activeTab === "orders" ? <OrdersPanel /> : null}
          {activeTab === "promotion" ? <PromotionPanel /> : null}
          {activeTab === "content" ? <ContentPanel /> : null}
          {activeTab === "kitchen" ? <KitchenPanel /> : null}
          {activeTab === "home" ? <HomePanel /> : null}
          {activeTab === "workshops" ? <WorkshopsPanel /> : null}
        </div>
      </main>
    </div>
  );
}
