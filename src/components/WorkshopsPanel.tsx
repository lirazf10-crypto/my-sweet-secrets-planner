import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleTaskList } from "@/components/SimpleTaskList";

function WorkshopCard({ id, name, onDeleted }: { id: string; name: string; onDeleted: () => void }) {
  const queryClient = useQueryClient();
  const [localName, setLocalName] = useState(name);

  const saveName = async () => {
    if (localName.trim() && localName.trim() !== name) {
      await supabase.from("workshop_plans").update({ name: localName.trim() }).eq("id", id);
      queryClient.invalidateQueries({ queryKey: ["workshop_plans"] });
    }
  };

  const deleteWorkshop = async () => {
    await supabase.from("workshop_plans").delete().eq("id", id);
    onDeleted();
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={saveName}
            className="flex-1 font-heading font-medium"
          />
          <button
            onClick={deleteWorkshop}
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label="מחיקת סדנה"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <SimpleTaskList
          table="workshop_plan_ideas"
          addPlaceholder="רעיון למתכון..."
          emptyText="אין עדיין רעיונות."
          withDetails
          filterColumn="workshop_plan_id"
          filterValue={id}
        />
      </CardContent>
    </Card>
  );
}

export default function WorkshopsPanel() {
  const queryClient = useQueryClient();

  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ["workshop_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshop_plans")
        .select("id, name")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addWorkshop = async () => {
    await supabase.from("workshop_plans").insert({ name: "סדנה חדשה", sort_order: workshops.length });
    queryClient.invalidateQueries({ queryKey: ["workshop_plans"] });
  };

  return (
    <div className="space-y-4">
      <Button onClick={addWorkshop}>סדנה חדשה</Button>

      {isLoading && <p className="text-muted-foreground">טוענת...</p>}
      {!isLoading && workshops.length === 0 && (
        <p className="text-muted-foreground">אין עדיין סדנאות מתוכננות.</p>
      )}

      <div className="space-y-4">
        {workshops.map((w) => (
          <WorkshopCard
            key={w.id}
            id={w.id}
            name={w.name}
            onDeleted={() => queryClient.invalidateQueries({ queryKey: ["workshop_plans"] })}
          />
        ))}
      </div>
    </div>
  );
}
