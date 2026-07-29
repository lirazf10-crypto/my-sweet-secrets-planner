import { SimpleTaskList } from "@/components/SimpleTaskList";

export default function HomePanel() {
  return (
    <SimpleTaskList
      table="home_tasks"
      addPlaceholder="סידור חדש..."
      emptyText="אין עדיין סידורים."
      calendarLabel="בית"
    />
  );
}
