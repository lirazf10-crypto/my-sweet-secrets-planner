import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/components/DateTimeFields";

type OverviewItem = {
  id: string;
  source: string;
  title: string;
  subtitle: string | null;
  due_date: string;
  start_time: string | null;
  end_time: string | null;
  done: boolean;
};

const SOURCE_LABELS: Record<string, string> = {
  home: "בית",
  kitchen_experiments: "מטבח (ניסוי)",
  kitchen_routine_tasks: "מטבח (שוטף)",
  office_tasks: "משרד",
  promotion_tasks: "קידום העסק",
  content_items: "תוכן",
  orders: "הזמנה",
  workshop_plan_ideas: "סדנה",
};

type SimpleRow = {
  id: string;
  title: string;
  is_done: boolean;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
};

function mapSimple(source: string, rows: SimpleRow[] | null): OverviewItem[] {
  return (rows ?? [])
    .filter((r) => r.due_date)
    .map((r) => ({
      id: `${source}-${r.id}`,
      source,
      title: r.title,
      subtitle: null,
      due_date: r.due_date as string,
      start_time: r.start_time,
      end_time: r.end_time,
      done: r.is_done,
    }));
}

export default function OverviewPanel() {
  const [hideDone, setHideDone] = useState(true);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["overview_dated_items"],
    queryFn: async () => {
      const simpleTables = [
        "home_tasks",
        "kitchen_experiments",
        "kitchen_routine_tasks",
        "office_tasks",
        "promotion_tasks",
        "workshop_plan_ideas",
      ] as const;

      const [simpleResults, contentResult, ordersResult] = await Promise.all([
        Promise.all(
          simpleTables.map((table) =>
            supabase
              .from(table)
              .select("id, title, is_done, due_date, start_time, end_time")
              .not("due_date", "is", null),
          ),
        ),
        supabase
          .from("content_items")
          .select("id, category, hook, status, due_date, start_time, end_time")
          .not("due_date", "is", null),
        supabase
          .from("orders")
          .select("id, description, status, delivery_date, start_time, end_time, customers(name)")
          .not("delivery_date", "is", null),
      ]);

      const merged: OverviewItem[] = [];

      simpleTables.forEach((table, i) => {
        merged.push(...mapSimple(table, simpleResults[i].data as SimpleRow[] | null));
      });

      (contentResult.data ?? []).forEach((r) => {
        merged.push({
          id: `content_items-${r.id}`,
          source: "content_items",
          title: r.hook || r.category,
          subtitle: r.hook ? r.category : null,
          due_date: r.due_date as string,
          start_time: r.start_time,
          end_time: r.end_time,
          done: r.status === "posted",
        });
      });

      (ordersResult.data as unknown as {
        id: string;
        description: string;
        status: string;
        delivery_date: string;
        start_time: string | null;
        end_time: string | null;
        customers: { name: string } | null;
      }[] ?? []).forEach((r) => {
        merged.push({
          id: `orders-${r.id}`,
          source: "orders",
          title: r.description,
          subtitle: r.customers?.name ?? null,
          due_date: r.delivery_date,
          start_time: r.start_time,
          end_time: r.end_time,
          done: r.status === "delivered" || r.status === "cancelled",
        });
      });

      return merged.sort((a, b) => {
        if (a.due_date !== b.due_date) return a.due_date < b.due_date ? -1 : 1;
        const at = a.start_time ?? "99:99";
        const bt = b.start_time ?? "99:99";
        return at < bt ? -1 : at > bt ? 1 : 0;
      });
    },
  });

  const visibleItems = hideDone ? items.filter((i) => !i.done) : items;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-medium">מה קרוב</h2>
        {items.length > 0 && (
          <button
            onClick={() => setHideDone((v) => !v)}
            className={`rounded-md px-2.5 py-1 text-xs border ${
              hideDone ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {hideDone ? "מציגה רק פתוחות" : "מציגה הכל"}
          </button>
        )}
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">טוענת...</p>}
      {!isLoading && items.length === 0 && (
        <p className="text-muted-foreground text-sm">אין עדיין משהו עם תאריך.</p>
      )}
      {!isLoading && items.length > 0 && visibleItems.length === 0 && (
        <p className="text-muted-foreground text-sm">הכל בוצע.</p>
      )}

      <div className="space-y-1 max-h-80 overflow-y-auto">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <p className={item.done ? "line-through text-muted-foreground" : ""}>
                {item.title}
                {item.subtitle && <span className="text-muted-foreground"> — {item.subtitle}</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDateTime(item.due_date, item.start_time, item.end_time)}
              </p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 rounded-md border border-border px-1.5 py-0.5">
              {SOURCE_LABELS[item.source]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
