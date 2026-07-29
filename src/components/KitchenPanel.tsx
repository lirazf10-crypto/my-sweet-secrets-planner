import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpleTaskList } from "@/components/SimpleTaskList";

function FreezerSection() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["kitchen_freezer_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kitchen_freezer_items")
        .select("id, title, is_checked")
        .order("is_checked", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await supabase.from("kitchen_freezer_items").insert({ title: title.trim() });
    await queryClient.invalidateQueries({ queryKey: ["kitchen_freezer_items"] });
    setTitle("");
  };

  const toggleChecked = async (id: string, isChecked: boolean) => {
    await supabase.from("kitchen_freezer_items").update({ is_checked: !isChecked }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["kitchen_freezer_items"] });
  };

  const deleteItem = async (id: string) => {
    await supabase.from("kitchen_freezer_items").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["kitchen_freezer_items"] });
  };

  return (
    <div className="space-y-3">
      <h2 className="font-heading font-medium">חוסרים למקפיא</h2>
      <form onSubmit={addItem} className="flex gap-2">
        <Input
          placeholder="פריט חדש..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">הוספה</Button>
      </form>

      {isLoading && <p className="text-muted-foreground">טוענת...</p>}
      {!isLoading && items.length === 0 && <p className="text-muted-foreground">אין עדיין פריטים.</p>}

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
            <input
              type="checkbox"
              checked={item.is_checked}
              onChange={() => toggleChecked(item.id, item.is_checked)}
              className="h-4 w-4 rounded border-input accent-primary shrink-0"
            />
            <span className={`flex-1 ${item.is_checked ? "line-through text-muted-foreground" : ""}`}>{item.title}</span>
            <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label="מחיקה">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KitchenPanel() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-heading font-medium">ניסויים במטבח</h2>
        <SimpleTaskList
          table="kitchen_experiments"
          addPlaceholder="מה יש להכין או לנסות..."
          emptyText="אין עדיין דברים לרשום."
          calendarLabel="מטבח (ניסוי)"
        />
      </div>
      <div className="border-t border-border" />
      <div className="space-y-3">
        <h2 className="font-heading font-medium">משימות שוטפות</h2>
        <SimpleTaskList
          table="kitchen_routine_tasks"
          addPlaceholder="משימה שוטפת חדשה..."
          emptyText="אין עדיין משימות שוטפות."
          calendarLabel="מטבח (שוטף)"
        />
      </div>
      <div className="border-t border-border" />
      <FreezerSection />
    </div>
  );
}
