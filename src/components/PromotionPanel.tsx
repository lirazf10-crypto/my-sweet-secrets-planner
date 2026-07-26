import { SimpleTaskList } from "@/components/SimpleTaskList";

export default function PromotionPanel() {
  return (
    <SimpleTaskList
      table="promotion_tasks"
      addPlaceholder="משימה חדשה..."
      emptyText="אין עדיין משימות."
    />
  );
}
