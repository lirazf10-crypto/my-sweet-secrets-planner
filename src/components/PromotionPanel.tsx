import { SimpleTaskList } from "@/components/SimpleTaskList";

export default function PromotionPanel() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-heading font-medium">משרד</h2>
        <SimpleTaskList
          table="office_tasks"
          addPlaceholder="משימת משרד חדשה..."
          emptyText="אין עדיין משימות משרד."
        />
      </div>
      <div className="border-t border-border" />
      <div className="space-y-3">
        <h2 className="font-heading font-medium">קידום העסק</h2>
        <SimpleTaskList
          table="promotion_tasks"
          addPlaceholder="משימת קידום חדשה..."
          emptyText="אין עדיין משימות קידום."
        />
      </div>
    </div>
  );
}
