import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DateTimeFields, formatDateTime } from "@/components/DateTimeFields";

const STATUS_LABELS: Record<string, string> = {
  idea: "רעיון",
  in_progress: "בעבודה",
  ready: "מוכן",
  posted: "פורסם",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS);

type ContentRow = {
  id: string;
  category: string;
  hook: string | null;
  storyboard: string | null;
  body: string | null;
  notes: string | null;
  status: string;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
};

export default function ContentPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [hook, setHook] = useState("");
  const [storyboard, setStoryboard] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editHook, setEditHook] = useState("");
  const [editStoryboard, setEditStoryboard] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [syncError, setSyncError] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["content_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("id, category, hook, storyboard, body, notes, status, due_date, start_time, end_time")
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContentRow[];
    },
  });

  const categories = Array.from(new Set(items.map((i) => i.category))).filter(Boolean);
  const filteredItems = statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter);

  const resetForm = () => {
    setCategory("");
    setHook("");
    setStoryboard("");
    setBody("");
    setNotes("");
    setFormError("");
    setDueDate("");
    setStartTime("");
    setEndTime("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!category.trim()) {
      setFormError("צריך למלא קטגוריה");
      return;
    }
    setSaving(true);
    const trimmedCategory = category.trim();
    const trimmedHook = hook.trim();
    const finalDueDate = dueDate || null;
    const finalStartTime = dueDate && startTime ? startTime : null;
    const finalEndTime = dueDate && endTime ? endTime : null;
    try {
      const { data: created, error } = await supabase
        .from("content_items")
        .insert({
          category: trimmedCategory,
          hook: trimmedHook || null,
          storyboard: storyboard.trim() || null,
          body: body.trim() || null,
          notes: notes.trim() || null,
          due_date: finalDueDate,
          start_time: finalStartTime,
          end_time: finalEndTime,
        })
        .select("id")
        .single();
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["content_items"] });
      resetForm();
      setShowForm(false);
      if (finalDueDate) {
        syncToCalendar(created.id, trimmedHook || trimmedCategory, finalDueDate, finalStartTime, finalEndTime);
      }
    } catch {
      setFormError("משהו השתבש בשמירה, נסי שוב");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("content_items").update({ status }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["content_items"] });
  };

  const deleteItem = async (id: string) => {
    await supabase.from("content_items").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["content_items"] });
  };

  const startEdit = (item: ContentRow) => {
    setEditingId(item.id);
    setEditCategory(item.category);
    setEditHook(item.hook ?? "");
    setEditStoryboard(item.storyboard ?? "");
    setEditBody(item.body ?? "");
    setEditNotes(item.notes ?? "");
    setEditDueDate(item.due_date ?? "");
    setEditStartTime(item.start_time ?? "");
    setEditEndTime(item.end_time ?? "");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setEditError("");
    if (!editCategory.trim()) {
      setEditError("צריך למלא קטגוריה");
      return;
    }
    setSavingEdit(true);
    const trimmedCategory = editCategory.trim();
    const trimmedHook = editHook.trim();
    const finalDueDate = editDueDate || null;
    const finalStartTime = editDueDate && editStartTime ? editStartTime : null;
    const finalEndTime = editDueDate && editEndTime ? editEndTime : null;
    try {
      const { error } = await supabase
        .from("content_items")
        .update({
          category: trimmedCategory,
          hook: trimmedHook || null,
          storyboard: editStoryboard.trim() || null,
          body: editBody.trim() || null,
          notes: editNotes.trim() || null,
          due_date: finalDueDate,
          start_time: finalStartTime,
          end_time: finalEndTime,
        })
        .eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["content_items"] });
      setEditingId(null);
      if (finalDueDate) {
        syncToCalendar(id, trimmedHook || trimmedCategory, finalDueDate, finalStartTime, finalEndTime);
      }
    } catch {
      setEditError("משהו השתבש בשמירה, נסי שוב");
    } finally {
      setSavingEdit(false);
    }
  };

  const syncToCalendar = async (
    id: string,
    syncTitle: string,
    due: string,
    start: string | null,
    end: string | null,
  ) => {
    setSyncError("");
    try {
      const { error } = await supabase.functions.invoke("smart-processor", {
        body: { table: "content_items", id, title: `תוכן: ${syncTitle}`, dueDate: due, startTime: start, endTime: end },
      });
      if (error) throw error;
    } catch {
      setSyncError("השליחה ליומן נכשלה, נסי שוב");
    }
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>תוכן חדש</Button>
      )}

      {showForm && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                list="content-categories"
                placeholder="קטגוריה (וואטסאפ, רשתות חברתיות, רעיונות לפני פיתוח...)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <datalist id="content-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <Input
                placeholder="הוק (כותרת/פתיח)"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
              />
              <Textarea
                placeholder="סטוריבורד / תכנון ויזואלי"
                value={storyboard}
                onChange={(e) => setStoryboard(e.target.value)}
                className="min-h-[60px]"
              />
              <Textarea
                placeholder="גוף הטקסט"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[80px]"
              />
              <Textarea
                placeholder="הערות"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[60px]"
              />
              <DateTimeFields
                dueDate={dueDate}
                onDueDateChange={setDueDate}
                startTime={startTime}
                onStartTimeChange={setStartTime}
                endTime={endTime}
                onEndTimeChange={setEndTime}
              />
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "שומרת..." : "שמירה"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-2.5 py-1 text-xs border ${
              statusFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            הכל
          </button>
          {STATUS_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`rounded-md px-2.5 py-1 text-xs border ${
                statusFilter === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {syncError && <p className="text-sm text-destructive">{syncError}</p>}

      {isLoading && <p className="text-muted-foreground">טוענת...</p>}
      {!isLoading && items.length === 0 && (
        <p className="text-muted-foreground">אין עדיין תוכן.</p>
      )}
      {!isLoading && items.length > 0 && filteredItems.length === 0 && (
        <p className="text-muted-foreground">אין תוכן בסטטוס הזה.</p>
      )}

      <div className="space-y-3">
        {filteredItems.map((item) => {
          if (editingId === item.id) {
            return (
              <Card key={item.id} className="border-primary">
                <CardContent className="p-4">
                  <form onSubmit={(e) => saveEdit(e, item.id)} className="space-y-3">
                    <Input
                      list="content-categories"
                      placeholder="קטגוריה"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      autoFocus
                    />
                    <Input
                      placeholder="הוק (כותרת/פתיח)"
                      value={editHook}
                      onChange={(e) => setEditHook(e.target.value)}
                    />
                    <Textarea
                      placeholder="סטוריבורד / תכנון ויזואלי"
                      value={editStoryboard}
                      onChange={(e) => setEditStoryboard(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Textarea
                      placeholder="גוף הטקסט"
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Textarea
                      placeholder="הערות"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <DateTimeFields
                      dueDate={editDueDate}
                      onDueDateChange={setEditDueDate}
                      startTime={editStartTime}
                      onStartTimeChange={setEditStartTime}
                      endTime={editEndTime}
                      onEndTimeChange={setEditEndTime}
                    />
                    {editError && <p className="text-sm text-destructive">{editError}</p>}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={savingEdit}>
                        {savingEdit ? "שומרת..." : "שמירה"}
                      </Button>
                      <Button type="button" variant="ghost" onClick={cancelEdit}>
                        ביטול
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={item.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                    {item.hook && <p className="font-medium">{item.hook}</p>}
                  </div>
                  <div className="flex gap-3 shrink-0 items-center">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-muted-foreground hover:text-destructive text-xs"
                    >
                      מחיקה
                    </button>
                  </div>
                </div>
                {item.storyboard && (
                  <p className="text-sm text-muted-foreground border-t border-border pt-2">
                    <span className="font-medium">סטוריבורד: </span>{item.storyboard}
                  </p>
                )}
                {item.body && (
                  <p className="text-sm whitespace-pre-wrap">{item.body}</p>
                )}
                {item.notes && (
                  <p className="text-sm text-muted-foreground border-t border-border pt-2 whitespace-pre-wrap">
                    <span className="font-medium">הערות: </span>{item.notes}
                  </p>
                )}
                {formatDateTime(item.due_date, item.start_time, item.end_time) && (
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(item.due_date, item.start_time, item.end_time)}
                  </p>
                )}
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  className="rounded-md bg-accent px-2.5 py-1 text-xs text-accent-foreground border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {STATUS_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
