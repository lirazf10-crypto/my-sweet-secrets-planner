import { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DateTimeFields, formatDateTime } from "@/components/DateTimeFields";

type SimpleTaskTable =
  | "promotion_tasks"
  | "office_tasks"
  | "kitchen_experiments"
  | "kitchen_routine_tasks"
  | "home_tasks"
  | "workshop_plan_ideas";

type SimpleTaskRow = {
  id: string;
  title: string;
  details?: string | null;
  is_done: boolean;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
};

export function SimpleTaskList({
  table,
  addPlaceholder,
  emptyText,
  withDetails = true,
  filterColumn,
  filterValue,
  calendarLabel,
}: {
  table: SimpleTaskTable;
  addPlaceholder: string;
  emptyText: string;
  withDetails?: boolean;
  filterColumn?: string;
  filterValue?: string;
  calendarLabel: string;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editShowDetails, setEditShowDetails] = useState(false);
  const [editDueDate, setEditDueDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [syncError, setSyncError] = useState<string | null>(null);

  const queryKey: (string | undefined)[] = filterColumn ? [table, filterColumn, filterValue] : [table];

  const { data: tasks = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const columns = withDetails
        ? "id, title, details, is_done, due_date, start_time, end_time, created_at"
        : "id, title, is_done, due_date, start_time, end_time, created_at";
      let query = supabase.from(table).select(columns);
      if (filterColumn && filterValue) query = query.eq(filterColumn, filterValue);
      const { data, error } = await query
        .order("is_done", { ascending: true })
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as SimpleTaskRow[];
    },
    enabled: !filterColumn || !!filterValue,
  });

  const resetForm = () => {
    setTitle("");
    setDetails("");
    setShowDetails(false);
    setDueDate("");
    setStartTime("");
    setEndTime("");
  };

  const syncToCalendar = async (id: string, syncTitle: string, due: string, start: string | null, end: string | null) => {
    setSyncError(null);
    try {
      const { error } = await supabase.functions.invoke("smart-processor", {
        body: { table, id, title: `${calendarLabel}: ${syncTitle}`, dueDate: due, startTime: start, endTime: end },
      });
      if (error) throw error;
    } catch {
      setSyncError("השליחה ליומן נכשלה, נסי שוב");
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    const trimmedTitle = title.trim();
    const finalDueDate = dueDate || null;
    const finalStartTime = dueDate && startTime ? startTime : null;
    const finalEndTime = dueDate && endTime ? endTime : null;
    const payload: Record<string, unknown> = {
      title: trimmedTitle,
      due_date: finalDueDate,
      start_time: finalStartTime,
      end_time: finalEndTime,
    };
    if (withDetails) payload.details = details.trim() || null;
    if (filterColumn && filterValue) payload[filterColumn] = filterValue;
    const { data: created } = await supabase.from(table).insert(payload as never).select("id").single();
    await queryClient.invalidateQueries({ queryKey });
    resetForm();
    setAdding(false);
    if (created && finalDueDate) {
      syncToCalendar((created as { id: string }).id, trimmedTitle, finalDueDate, finalStartTime, finalEndTime);
    }
  };

  const toggleDone = async (id: string, isDone: boolean) => {
    await supabase.from(table).update({ is_done: !isDone } as never).eq("id", id);
    queryClient.invalidateQueries({ queryKey });
  };

  const deleteTask = async (id: string) => {
    await supabase.from(table).delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey });
  };

  const startEdit = (task: SimpleTaskRow) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDetails(task.details ?? "");
    setEditShowDetails(!!task.details);
    setEditDueDate(task.due_date ?? "");
    setEditStartTime(task.start_time ?? "");
    setEditEndTime(task.end_time ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setSavingEdit(true);
    const trimmedTitle = editTitle.trim();
    const finalDueDate = editDueDate || null;
    const finalStartTime = editDueDate && editStartTime ? editStartTime : null;
    const finalEndTime = editDueDate && editEndTime ? editEndTime : null;
    const payload: Record<string, unknown> = {
      title: trimmedTitle,
      due_date: finalDueDate,
      start_time: finalStartTime,
      end_time: finalEndTime,
    };
    if (withDetails) payload.details = editDetails.trim() || null;
    await supabase.from(table).update(payload as never).eq("id", id);
    await queryClient.invalidateQueries({ queryKey });
    setEditingId(null);
    setSavingEdit(false);
    if (finalDueDate) {
      syncToCalendar(id, trimmedTitle, finalDueDate, finalStartTime, finalEndTime);
    }
  };

  const visibleTasks = hideDone ? tasks.filter((t) => !t.is_done) : tasks;

  return (
    <div className="space-y-4">
      <form onSubmit={addTask} className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder={addPlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={adding}>הוספה</Button>
        </div>
        {withDetails && (
          !showDetails ? (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="text-sm text-muted-foreground hover:text-foreground ml-3"
            >
              + הוספת פירוט
            </button>
          ) : (
            <Textarea
              placeholder="פירוט נוסף (אופציונלי)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[60px]"
            />
          )
        )}
        <DateTimeFields
          dueDate={dueDate}
          onDueDateChange={setDueDate}
          startTime={startTime}
          onStartTimeChange={setStartTime}
          endTime={endTime}
          onEndTimeChange={setEndTime}
        />
      </form>

      {tasks.length > 0 && (
        <button
          onClick={() => setHideDone((v) => !v)}
          className={`rounded-md px-2.5 py-1 text-xs border ${
            hideDone ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          {hideDone ? "מציגה רק פתוחות" : "מציגה הכל"}
        </button>
      )}

      {syncError && <p className="text-sm text-destructive">{syncError}</p>}

      {isLoading && <p className="text-muted-foreground">טוענת...</p>}
      {!isLoading && tasks.length === 0 && <p className="text-muted-foreground">{emptyText}</p>}
      {!isLoading && tasks.length > 0 && visibleTasks.length === 0 && (
        <p className="text-muted-foreground">הכל בוצע.</p>
      )}

      <div className="space-y-1">
        {visibleTasks.map((task) => {
          const dt = formatDateTime(task.due_date, task.start_time, task.end_time);

          if (editingId === task.id) {
            return (
              <form
                key={task.id}
                onSubmit={(e) => saveEdit(e, task.id)}
                className="space-y-2 rounded-md border border-primary bg-card px-3 py-2"
              >
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
                {withDetails && (
                  !editShowDetails ? (
                    <button
                      type="button"
                      onClick={() => setEditShowDetails(true)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      + הוספת פירוט
                    </button>
                  ) : (
                    <Textarea
                      placeholder="פירוט נוסף (אופציונלי)"
                      value={editDetails}
                      onChange={(e) => setEditDetails(e.target.value)}
                      className="min-h-[60px]"
                    />
                  )
                )}
                <DateTimeFields
                  dueDate={editDueDate}
                  onDueDateChange={setEditDueDate}
                  startTime={editStartTime}
                  onStartTimeChange={setEditStartTime}
                  endTime={editEndTime}
                  onEndTimeChange={setEditEndTime}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={savingEdit}>
                    <Check className="w-4 h-4 ml-1" />
                    שמירה
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                    <X className="w-4 h-4 ml-1" />
                    ביטול
                  </Button>
                </div>
              </form>
            );
          }

          return (
            <div key={task.id} className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-2">
              <input
                type="checkbox"
                checked={task.is_done}
                onChange={() => toggleDone(task.id, task.is_done)}
                className="h-4 w-4 mt-1 rounded border-input accent-primary shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={task.is_done ? "line-through text-muted-foreground" : ""}>{task.title}</p>
                {withDetails && task.details && (
                  <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">{task.details}</p>
                )}
                {dt && <p className="text-xs text-muted-foreground mt-0.5">{dt}</p>}
              </div>
              <button
                onClick={() => startEdit(task)}
                className="text-muted-foreground hover:text-foreground shrink-0 mt-1"
                aria-label="עריכה"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-muted-foreground hover:text-destructive shrink-0 mt-1"
                aria-label="מחיקה"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
